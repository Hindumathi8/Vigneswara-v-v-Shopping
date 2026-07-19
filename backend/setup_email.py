from pathlib import Path

base = Path(__file__).resolve().parent
print("Vigneswara Sarees Email Setup")
email = input("Sender Gmail (example: vigneswarasarees404@gmail.com): ").strip()
password = input("Gmail App Password (16 characters, spaces OK): ").strip().replace(" ", "")
owner = input("Owner email [Leelapramodsundaraneedi@gmail.com]: ").strip() or "Leelapramodsundaraneedi@gmail.com"
content = f"SMTP_EMAIL={email}\nSMTP_PASSWORD={password}\nOWNER_EMAIL={owner}\nEMAIL_USER={email}\nEMAIL_PASS={password}\n"
(base / ".env").write_text(content)
print("\nDone: backend/.env created")
print("Now run: python3 check_email_config.py")
