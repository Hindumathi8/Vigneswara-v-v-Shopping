# Vigneswara Sarees - Final Code

## Run Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 setup_email.py
python3 check_email_config.py
python3 app.py
```

Backend runs on: `http://localhost:5010`

## Run Frontend

Open new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

## Email Config

`backend/.env` must contain either this:

```env
SMTP_EMAIL=yourgmail@gmail.com
SMTP_PASSWORD=your16digitgoogleapppassword
OWNER_EMAIL=Durgaprasadkonda@gmail.com
```

Or old names also supported:

```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your16digitgoogleapppassword
OWNER_EMAIL=Durgaprasadkonda@gmail.com
```

Use Gmail App Password, not normal Gmail password.

## Features Included

- Multiple product photos upload
- Product video upload
- Product image gallery and video preview
- Separate address fields: street, village, city, pincode
- Cash on Delivery and UPI payment flow
- PhonePe / Google Pay / UPI link with amount
- Order tracking
- Owner email notification
- Admin settings and change password

# VIGNESWARA SAREES

Full-stack clothing/saree shopping website.

## Features
- Black & white luxury theme
- e layout, original branding
- Logo in top navbar
- Shop dropdown with all saree types
- Search, filter, price filter, sort
- Light mode / dark mode toggle
- Editable homepage offers from owner panel
- Editable shop WhatsApp number from owner panel
- Real image upload in owner/admin panel
- Owner-only login; customers do not need login
- Add, edit, delete sarees
- Cart order opens WhatsApp message to shop number
- SQLite backend

## Admin Login
Username: `admin`
Password: `admin12345`

## Run Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```
Backend runs at `http://localhost:5010`.

## Run Frontend
Open new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the shown localhost URL, usually `http://localhost:5173`.

## Owner email notification setup
Order notification email is sent to: `Durgaprasadkonda@gmail.com`.

For Gmail sending, create a Gmail App Password and run backend like this:

```bash
cd backend
export SMTP_EMAIL="your-sender-gmail@gmail.com"
export SMTP_PASSWORD="your-gmail-app-password"
python3 app.py
```

Mobile number is not required for email notification. Without SMTP_EMAIL and SMTP_PASSWORD, the order will still be saved and tracking will show, but the email will be printed in backend terminal instead of being sent.

## Admin password change
Login as owner, open **Settings**, then use **Change Admin Password**.

## Latest Order + Payment Update

- Order form now collects Street/Door No, Village/Area, City/Town, and Pincode separately.
- Payment methods added:
  - Cash on Delivery
  - PhonePe / Google Pay / UPI
- Admin Settings includes:
  - Payment Phone Number
  - Optional UPI ID
- Order email now includes customer address columns and payment details.

Note: PhonePe/Google Pay payment is shown as owner payment details. Online payment gateway auto-verification is not included because that requires a paid/payment provider setup.

## Latest fixes

### Multiple product photos
Owner Dashboard -> Add Product -> Saree Photos now supports selecting many photos together and also adding photos one-by-one. Selected photos show preview before saving.

### Owner email notification
Order email contains customer name, phone, street/door no, village/area, city/town, pincode, full address, items, total amount, and payment method.

Email will send only after backend SMTP is configured. In `backend/.env` add:

```env
SMTP_EMAIL=yourgmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

Then run backend normally. Without SMTP, the order is still saved and visible in Owner Dashboard -> Orders, but email cannot be sent.

### Online payment
For direct PhonePe / Google Pay open with amount, add owner UPI ID in Owner Dashboard -> Settings -> UPI ID, for example:

```text
ownername@oksbi
ownername@ybl
ownername@okaxis
```

Mobile number alone is not enough for reliable direct UPI payment. UPI ID is required.

## Latest UI update
- Accurate search by saree name, type, color and description with relevance ranking.
- Attractive offers section.
- Removed the old all-types strip below offers.
- Added AI help bot for order, payment, tracking and address help.
- Added shop address: Sanivarapupeta, Eluru, Andhra Pradesh - 534003.

Run frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Run backend:
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```

## Latest integrated fixes
- Backend `/search?q=` API added for accurate product search by name, saree type, color and description.
- Backend `/shop-info` API added with shop address: Sanivarapupeta, Eluru, Andhra Pradesh - 534003.
- Backend settings now includes `shop_address`.
- Frontend includes improved search, attractive offers section, AI help bot, and shop address display.
# VVV-Shop
# Vigneswara-v-v-Shopping
