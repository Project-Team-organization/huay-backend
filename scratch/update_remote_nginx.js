const { runRemoteCommand } = require("../test/remote-ssh");

async function main() {
  const pythonScript = `
with open('/etc/nginx/sites-available/luckyk168.com', 'r') as f:
    content = f.read()

socket_block = '''    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
'''

target = 'server_name api.luckyk168.com;\\n'
if target in content and 'location /socket.io/' not in content:
    content = content.replace(target, target + '\\n' + socket_block + '\\n')
    with open('/etc/nginx/sites-available/luckyk168.com', 'w') as f:
        f.write(content)
    print('Updated successfully')
else:
    print('Already configured or target not found')
`;

  // Write python script to /tmp/update_nginx.py on server and execute
  const base64Script = Buffer.from(pythonScript).toString("base64");
  const remoteCmd = `
    cp /etc/nginx/sites-available/luckyk168.com /etc/nginx/sites-available/luckyk168.com.bak &&
    echo '${base64Script}' | base64 -d > /tmp/update_nginx.py &&
    python3 /tmp/update_nginx.py &&
    nginx -t &&
    systemctl reload nginx &&
    echo 'NGINX_RELOAD_SUCCESS'
  `;

  console.log("Running remote update...");
  const res = await runRemoteCommand(remoteCmd);
  console.log("Stdout:", res.stdout);
  console.log("Stderr:", res.stderr);
}

main().catch(console.error);
