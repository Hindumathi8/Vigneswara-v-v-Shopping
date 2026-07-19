VIGNESWARA SAREES - EMAIL FULL SETUP

1) Open terminal in backend folder:
   cd backend

2) Install dependencies:
   pip3 install -r requirements.txt

3) Create email config:
   python3 setup_email.py

Enter:
   Sender Gmail: vigneswarasarees404@gmail.com
   Gmail App Password: your 16-character Google App Password
   Owner email: Durgaprasadkonda@gmail.com

4) Check config:
   python3 check_email_config.py

Expected:
   Sender email: vigneswarasarees404@gmail.com
   App password loaded: YES
   Owner email: Durgaprasadkonda@gmail.com

5) Send test email:
   python3 test_email_send.py

6) Run backend:
   python3 app.py

If email says Connection unexpectedly closed:
- Generate a fresh Gmail App Password
- Confirm Google 2-Step Verification is ON
- Try another internet network / mobile hotspot
- Some WiFi networks block SMTP ports 465/587
