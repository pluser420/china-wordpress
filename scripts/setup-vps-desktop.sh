#!/bin/bash
# =============================================================
# Jiayi Tools VPS Desktop Setup Script
# Installs: XFCE4 desktop + TigerVNC + noVNC + VS Code
# Access via browser at http://YOUR_IP:6080/vnc.html
# =============================================================

set -e

echo "========================================"
echo " Jiayi Tools VPS Desktop Setup"
echo "========================================"

# 1. Update system
echo "[1/7] Updating system packages..."
apt update -y && apt upgrade -y

# 2. Install XFCE desktop
echo "[2/7] Installing XFCE desktop..."
apt install -y \
  xfce4 \
  xfce4-goodies \
  xfce4-terminal \
  tightvncserver \
  novnc \
  websockify \
  dbus-x11 \
  x11-utils \
  wget \
  curl \
  git \
  unzip \
  fonts-noto \
  firefox

# 3. Configure VNC
echo "[3/7] Configuring VNC..."
mkdir -p ~/.vnc

# Set VNC password (default: jiayi2024)
VNC_PASSWORD=${VNC_PASSWORD:-jiayi2024}
echo "$VNC_PASSWORD" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Configure XFCE startup
cat > ~/.vnc/xstartup << 'XSTARTUP'
#!/bin/bash
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
export XKL_XMODMAP_DISABLE=1
xrdb $HOME/.Xresources 2>/dev/null || true
xsetroot -solid grey
startxfce4 &
XSTARTUP
chmod +x ~/.vnc/xstartup

# 4. Install VS Code (since Kiro is VS Code based)
echo "[4/7] Installing VS Code..."
wget -qO /tmp/vscode.deb "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64"
apt install -y /tmp/vscode.deb || true
rm -f /tmp/vscode.deb

# 5. Start VNC server
echo "[5/7] Starting VNC server..."
vncserver -kill :1 2>/dev/null || true
sleep 1
vncserver :1 -geometry 1440x900 -depth 24 -localhost

# 6. Start noVNC
echo "[6/7] Starting noVNC (browser access)..."
pkill -f websockify 2>/dev/null || true
sleep 1
websockify --web /usr/share/novnc 6080 localhost:5901 --daemon

# 7. Create auto-start script
echo "[7/7] Creating startup script..."
cat > /usr/local/bin/start-desktop << 'STARTSCRIPT'
#!/bin/bash
vncserver -kill :1 2>/dev/null || true
sleep 1
vncserver :1 -geometry 1440x900 -depth 24 -localhost
pkill -f websockify 2>/dev/null || true
websockify --web /usr/share/novnc 6080 localhost:5901 --daemon
echo "Desktop started! Access at http://$(curl -s ifconfig.me):6080/vnc.html"
STARTSCRIPT
chmod +x /usr/local/bin/start-desktop

# Create systemd service for auto-start on reboot
cat > /etc/systemd/system/vps-desktop.service << 'SERVICE'
[Unit]
Description=VPS Desktop (VNC + noVNC)
After=network.target

[Service]
Type=forking
User=root
ExecStart=/usr/local/bin/start-desktop
Restart=on-failure

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable vps-desktop

echo ""
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo " Open in browser:"
echo " http://$(curl -s ifconfig.me 2>/dev/null || echo '2.24.117.177'):6080/vnc.html"
echo ""
echo " VNC Password: $VNC_PASSWORD"
echo ""
echo " To restart desktop anytime: start-desktop"
echo "========================================"
