import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
loaded=[]
for name in ['.env','password.env','email.env']:
    f=BASE_DIR/name
    if f.exists():
        load_dotenv(f, override=True)
        loaded.append(str(f))

def clean(v, password=False):
    if not v: return None
    v=v.strip().strip('"').strip("'")
    return v.replace(' ','') if password else v

email=clean(os.getenv('SMTP_EMAIL') or os.getenv('EMAIL_USER') or os.getenv('SENDER_EMAIL'))
password=clean(os.getenv('SMTP_PASSWORD') or os.getenv('EMAIL_PASS') or os.getenv('SENDER_APP_PASSWORD'), True)
owner=clean(os.getenv('OWNER_EMAIL'))

print('Loaded env files:', loaded if loaded else 'NONE')
print('Sender email:', email or 'NOT SET')
print('App password loaded:', 'YES' if password else 'NO')
print('Owner email:', owner or 'NOT SET')

if not email or not password:
    print('\nFIX: create backend/.env with:')
    print('SMTP_EMAIL=yourgmail@gmail.com')
    print('SMTP_PASSWORD=your16digitapppassword')
    print('OWNER_EMAIL=Leelapramodsundaraneedi@gmail.com')
else:
    print('\nEmail config looks OK.')
    print('Next test email: python3 test_email_send.py')
    print('Then restart backend: python3 app.py')
