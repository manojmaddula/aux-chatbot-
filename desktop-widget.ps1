<#
.SYNOPSIS
    NICE CXone ZEL Ask Shankar & AUX Assistant - Native Windows Desktop Floating Widget & System Tray Companion
.DESCRIPTION
    Creates a native, transparent, draggable floating Panda widget on the user's laptop screen,
    and installs a Panda System Tray icon into the Windows Taskbar Notification Area ("Toolbar Hidden Icons").
#>

[CmdletBinding()]
param()

# Ensure required assemblies are loaded
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Determine project base directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$icoPath = Join-Path $scriptDir "src\favicon.ico"
$pngPath = Join-Path $scriptDir "src\favicon.png"

if (-not (Test-Path $icoPath)) {
    $icoPath = "C:\Users\maddu\.gemini\antigravity\scratch\aux-chatbot-\src\favicon.ico"
}
if (-not (Test-Path $pngPath)) {
    $pngPath = "C:\Users\maddu\.gemini\antigravity\scratch\aux-chatbot-\src\favicon.png"
}

# Auto-start Node.js server if not already running on port 4000
try {
    $conn = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
    if (-not $conn) {
        $serverScript = Join-Path $scriptDir "server.js"
        if (-not (Test-Path $serverScript)) {
            $serverScript = "C:\Users\maddu\.gemini\antigravity\scratch\aux-chatbot-\server.js"
        }
        Start-Process "node" -ArgumentList "`"$serverScript`"" -WorkingDirectory $scriptDir -WindowStyle Hidden
        Start-Sleep -Milliseconds 1200
    }
} catch {}

# Helper to open local application window (prefer Edge App mode for clean native-like borderless window)
function Open-AppWindow([string]$url, [int]$width = 460, [int]$height = 760) {
    $edgePaths = @(
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    )
    $edgeExe = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($edgeExe) {
        Start-Process $edgeExe -ArgumentList "--app=$url", "--window-size=$width,$height"
    } else {
        Start-Process $url
    }
}

# Helper to cleanly shut down
function Exit-PandaApp {
    if ($global:notifyIcon) {
        $global:notifyIcon.Visible = $false
        $global:notifyIcon.Dispose()
    }
    if ($global:floatingWindow) {
        $global:floatingWindow.Close()
    }
    if ($global:wpfApp) {
        $global:wpfApp.Shutdown()
    }
    [System.Windows.Forms.Application]::Exit()
    [System.Environment]::Exit(0)
}

# Initialize WPF Application with explicit shutdown (persists when window hides)
$global:wpfApp = New-Object System.Windows.Application
$global:wpfApp.ShutdownMode = [System.Windows.ShutdownMode]::OnExplicitShutdown

# Get Primary Screen Working Area for intelligent initial positioning (bottom-right above taskbar)
$screenBounds = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$initialLeft = [Math]::Max(50, $screenBounds.Right - 96)
$initialTop = [Math]::Max(50, $screenBounds.Bottom - 110)

# XAML definition for the floating Panda badge
$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="ZEL Ask Shankar"
        WindowStyle="None"
        AllowsTransparency="True"
        Background="Transparent"
        Topmost="True"
        ShowInTaskbar="False"
        Width="78"
        Height="78"
        WindowStartupLocation="Manual"
        Left="$initialLeft"
        Top="$initialTop">
    <Grid Margin="5" Cursor="Hand" ToolTip="🐼 ZEL Ask Shankar&#x0a;• Left-click: Open Ask Shankar&#x0a;• Drag: Move anywhere on screen&#x0a;• Right-click: Menu">
        <!-- Floating Circular Container with Outer Ring & Glow Shadow -->
        <Border x:Name="OuterBorder"
                Width="68" Height="68"
                CornerRadius="34"
                Background="#FFFFFF"
                BorderBrush="#2563EB"
                BorderThickness="2.8">
            <Border.Effect>
                <DropShadowEffect BlurRadius="18" ShadowDepth="4" Direction="270" Color="#0F172A" Opacity="0.42"/>
            </Border.Effect>
            <Grid>
                <!-- Panda Animal Logo -->
                <Image x:Name="PandaImage"
                       Width="44" Height="44"
                       HorizontalAlignment="Center"
                       VerticalAlignment="Center"
                       Stretch="Uniform"/>
                
                <!-- Active Connection Glowing Green Dot -->
                <Ellipse Width="15" Height="15"
                         Fill="#10B981"
                         Stroke="#FFFFFF"
                         StrokeThickness="2.5"
                         HorizontalAlignment="Right"
                         VerticalAlignment="Top"
                         Margin="0,2,2,0">
                    <Ellipse.Effect>
                        <DropShadowEffect BlurRadius="6" ShadowDepth="0" Color="#10B981" Opacity="0.95"/>
                    </Ellipse.Effect>
                </Ellipse>
            </Grid>
        </Border>
    </Grid>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$global:floatingWindow = [System.Windows.Markup.XamlReader]::Load($reader)

# Load Panda Image into WPF element
$imgCtrl = $global:floatingWindow.FindName("PandaImage")
if ($imgCtrl -and (Test-Path $pngPath)) {
    try {
        $bmp = New-Object System.Windows.Media.Imaging.BitmapImage
        $bmp.BeginInit()
        $bmp.UriSource = [System.Uri]::new($pngPath)
        $bmp.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
        $bmp.EndInit()
        $imgCtrl.Source = $bmp
    } catch {}
}

# Hover animation styling on border
$outerBorder = $global:floatingWindow.FindName("OuterBorder")
$global:floatingWindow.Add_MouseEnter({
    if ($outerBorder) {
        $outerBorder.BorderBrush = [System.Windows.Media.Brushes]::DodgerBlue
        $outerBorder.Width = 70
        $outerBorder.Height = 70
    }
})
$global:floatingWindow.Add_MouseLeave({
    if ($outerBorder) {
        $brushConverter = New-Object System.Windows.Media.BrushConverter
        $outerBorder.BorderBrush = $brushConverter.ConvertFromString("#2563EB")
        $outerBorder.Width = 68
        $outerBorder.Height = 68
    }
})

# Native Left-Click Drag & Open Logic
$global:floatingWindow.Add_MouseLeftButtonDown({
    param($s, $e)
    $startPos = [System.Windows.Forms.Cursor]::Position
    try {
        $global:floatingWindow.DragMove()
    } catch {}
    $endPos = [System.Windows.Forms.Cursor]::Position
    $dist = [Math]::Sqrt([Math]::Pow($endPos.X - $startPos.X, 2) + [Math]::Pow($endPos.Y - $startPos.Y, 2))
    
    # If moved less than 6 pixels, it is a click! Open Ask Shankar Companion Widget
    if ($dist -lt 6) {
        Open-AppWindow "http://localhost:4000/widget.html" 460 760
    }
})

# Native Right-Click Context Menu for Floating Widget
$widgetMenu = New-Object System.Windows.Controls.ContextMenu

$wItemCopilot = New-Object System.Windows.Controls.MenuItem
$wItemCopilot.Header = "💬 Open Ask Shankar & ACW Assistant"
$wItemCopilot.FontWeight = [System.Windows.FontWeights]::Bold
$wItemCopilot.Add_Click({ Open-AppWindow "http://localhost:4000/widget.html" 460 760 })
$widgetMenu.Items.Add($wItemCopilot) | Out-Null

$wItemHome = New-Object System.Windows.Controls.MenuItem
$wItemHome.Header = "🤖 Open Agent Bot Workstation"
$wItemHome.Add_Click({ Open-AppWindow "http://localhost:4000/agent-home.html" 1220 820 })
$widgetMenu.Items.Add($wItemHome) | Out-Null

$wItemPortal = New-Object System.Windows.Controls.MenuItem
$wItemPortal.Header = "☕ Open AUX Break Portal"
$wItemPortal.Add_Click({ Open-AppWindow "http://localhost:4000/portal.html" 920 800 })
$widgetMenu.Items.Add($wItemPortal) | Out-Null

$wItemSup = New-Object System.Windows.Controls.MenuItem
$wItemSup.Header = "🛡️ Open Supervisor Command Center"
$wItemSup.Add_Click({ Open-AppWindow "http://localhost:4000/supervisor.html" 1280 860 })
$widgetMenu.Items.Add($wItemSup) | Out-Null

$widgetMenu.Items.Add((New-Object System.Windows.Controls.Separator)) | Out-Null

$wItemHide = New-Object System.Windows.Controls.MenuItem
$wItemHide.Header = "👁️ Hide to Taskbar Hidden Icons"
$wItemHide.Add_Click({
    $global:floatingWindow.Hide()
    if ($global:notifyIcon) {
        $global:notifyIcon.ShowBalloonTip(3000, "ZEL Ask Shankar", "Panda widget hidden. Click the Panda icon in taskbar hidden icons anytime to show it!", [System.Windows.Forms.ToolTipIcon]::Info)
    }
})
$widgetMenu.Items.Add($wItemHide) | Out-Null

$wItemExit = New-Object System.Windows.Controls.MenuItem
$wItemExit.Header = "✕ Exit Application"
$wItemExit.Add_Click({ Exit-PandaApp })
$widgetMenu.Items.Add($wItemExit) | Out-Null

$global:floatingWindow.ContextMenu = $widgetMenu

# ==============================================================================
# WINDOWS SYSTEM TRAY ICON (TOOLBAR HIDDEN ICONS / NOTIFICATION AREA)
# ==============================================================================
$global:notifyIcon = New-Object System.Windows.Forms.NotifyIcon
if (Test-Path $icoPath) {
    $global:notifyIcon.Icon = [System.Drawing.Icon]::new($icoPath)
} else {
    $global:notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
}
$global:notifyIcon.Text = "NICE CXone ZEL Ask Shankar & AUX Assistant"
$global:notifyIcon.Visible = $true

# System Tray Right-Click Context Menu
$trayMenu = New-Object System.Windows.Forms.ContextMenuStrip

$trayToggle = $trayMenu.Items.Add("🐼 Show / Hide Floating Panda Widget")
$trayToggle.Font = New-Object System.Drawing.Font($trayToggle.Font, [System.Drawing.FontStyle]::Bold)
$trayToggle.Add_Click({
    if ($global:floatingWindow.IsVisible) {
        $global:floatingWindow.Hide()
    } else {
        $global:floatingWindow.Show()
        $global:floatingWindow.Activate()
    }
})

$trayMenu.Items.Add("-") | Out-Null

$trayCopilot = $trayMenu.Items.Add("💬 Open Ask Shankar & ACW Assistant")
$trayCopilot.Add_Click({ Open-AppWindow "http://localhost:4000/widget.html" 460 760 })

$trayHome = $trayMenu.Items.Add("🤖 Open Agent Bot Workstation")
$trayHome.Add_Click({ Open-AppWindow "http://localhost:4000/agent-home.html" 1220 820 })

$trayPortal = $trayMenu.Items.Add("☕ Open AUX Break Portal")
$trayPortal.Add_Click({ Open-AppWindow "http://localhost:4000/portal.html" 920 800 })

$traySup = $trayMenu.Items.Add("🛡️ Open Supervisor Command Center")
$traySup.Add_Click({ Open-AppWindow "http://localhost:4000/supervisor.html" 1280 860 })

$trayMenu.Items.Add("-") | Out-Null

$trayBrowser = $trayMenu.Items.Add("🌐 Open in Default Web Browser")
$trayBrowser.Add_Click({ Start-Process "http://localhost:4000/agent-home.html" })

$trayRestart = $trayMenu.Items.Add("🔄 Restart Backend Server")
$trayRestart.Add_Click({
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 600
    Start-Process "node" -ArgumentList "server.js" -WorkingDirectory $scriptDir -WindowStyle Hidden
    if ($global:notifyIcon) {
        $global:notifyIcon.ShowBalloonTip(2000, "ZEL Backend Server", "Server restarted on http://localhost:4000", [System.Windows.Forms.ToolTipIcon]::Info)
    }
})

$trayExit = $trayMenu.Items.Add("✕ Exit Application")
$trayExit.Add_Click({ Exit-PandaApp })

$global:notifyIcon.ContextMenuStrip = $trayMenu

# Tray Click / Double-Click Toggle
$global:notifyIcon.Add_Click({
    param($s, $e)
    # Check if left mouse button clicked
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        if ($global:floatingWindow.IsVisible) {
            $global:floatingWindow.Hide()
        } else {
            $global:floatingWindow.Show()
            $global:floatingWindow.Activate()
        }
    }
})

# Show startup balloon notification in system tray
try {
    $global:notifyIcon.ShowBalloonTip(3000, "🐼 ZEL Ask Shankar Active", "Floating Panda widget is active on your screen! Find it in toolbar hidden icons anytime.", [System.Windows.Forms.ToolTipIcon]::Info)
} catch {}

# Show floating window on screen and start message pump
$global:floatingWindow.Show()
$global:wpfApp.Run($global:floatingWindow)
