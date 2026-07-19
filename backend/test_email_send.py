import os
import ssl
import smtplib
from pathlib import Path
from email.mime.text import MIMEText
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
loaded = []
for name in [".env", "password.env", "email.env"]:
    p = BASE_DIR / name
    if p.exists():
        load_dotenv(p, override=True)
        loaded.append(str(p))

def clean(value, is_password=False):
    if not value:
        return ""
    value = value.strip().strip('"').strip("'")
    return value.replace(" ", "") if is_password else value

sender = clean(os.getenv("SMTP_EMAIL") or os.getenv("EMAIL_USER") or os.getenv("SENDER_EMAIL"))
password = clean(os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS") or os.getenv("SENDER_APP_PASSWORD"), True)
owner = clean(os.getenv("OWNER_EMAIL") or "Durgaprasadkonda@gmail.com")

print("Loaded env files:", loaded if loaded else "NONE")
print("Sender:", sender or "NOT SET")
print("Password:", "YES" if password else "NO")
print("Owner:", owner or "NOT SET")

if not sender or not password:
    raise SystemExit("\nMissing sender/password. Run: python3 setup_email.py")

msg = MIMEText("Test email from Vigneswara Sarees backend. Email setup is working.", "plain")
msg["From"] = f"Vigneswara Sarees <{sender}>"
msg["To"] = owner
msg["Subject"] = "Vigneswara Sarees Email Test"

errors = []
try:
    print("Trying Gmail SSL 465...")
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=30) as server:
        server.login(sender, password)
        server.sendmail(sender, [owner], msg.as_string())
    print("SUCCESS: Test email sent using SSL 465")
    raise SystemExit(0)
except Exception as e:
    errors.append(f"SSL 465 failed: {e}")
    print(errors[-1])

try:
    print("Trying Gmail STARTTLS 587...")
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.ehlo()
        server.starttls(context=ssl.create_default_context())
        server.ehlo()
        server.login(sender, password)
        server.sendmail(sender, [owner], msg.as_string())
    print("SUCCESS: Test email sent using STARTTLS 587")
except Exception as e:
    errors.append(f"STARTTLS 587 failed: {e}")
    print(errors[-1])
    print("\nEmail still failed. Check these:")
    print("1) Gmail App Password is fresh and copied correctly")
    print("2) 2-Step Verification is ON")
    print("3) Internet/network is not blocking smtp.gmail.com ports 465/587")
    print("4) Try hotspot/mobile data once")
    raise SystemExit(1)
