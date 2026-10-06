import os
import sys
import json
import webbrowser
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import extract_data

PORT = 8000

class StaffAppHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable cache for fresh data
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            if not os.path.exists('data.json'):
                extract_data.extract()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            with open('data.json', 'rb') as f:
                self.wfile.write(f.read())
            return

        if self.path == '/api/reload':
            try:
                extract_data.extract()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok', 'message': 'Data reloaded successfully'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
                return

        if self.path.startswith('/api/tiers'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.end_headers()
            if os.path.exists('tiers.json'):
                with open('tiers.json', 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'{}')
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/tiers':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                with open('tiers.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                # Sync to cloud in background thread
                def _bg_cloud_sync(payload):
                    try:
                        import urllib.request
                        req = urllib.request.Request(
                            'https://extendsclass.com/api/json-storage/bin/cdbfeab',
                            data=json.dumps(payload).encode('utf-8'),
                            headers={'Content-Type': 'application/json'},
                            method='PUT'
                        )
                        urllib.request.urlopen(req, timeout=5)
                    except Exception as err:
                        print(f"Background cloud sync error: {err}")

                threading.Thread(target=_bg_cloud_sync, args=(data,)).start()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    # Ensure data.json exists
    if not os.path.exists('data.json'):
        print("Extracting data from Excel file...")
        extract_data.extract()

    server_address = ('', PORT)
    httpd = HTTPServer(server_address, StaffAppHandler)
    print(f"==================================================")
    print(f" Staff Evaluation Portal is running!")
    print(f" Local URL: http://localhost:{PORT}")
    print(f" Press Ctrl+C to stop the server")
    print(f"==================================================")
    
    # Auto open browser
    threading.Timer(0.8, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
