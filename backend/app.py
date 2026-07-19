from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3, os, time, secrets, hmac, hashlib, base64, json, smtplib, ssl
from functools import wraps
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Always load environment files from the backend folder, no matter where
# `python3 app.py` is started from. Supports .env, password.env and common
# accidental names. Values are also cleaned for spaces/quotes.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_email_environment():
    env_files = [
        os.path.join(BASE_DIR, '.env'),
        os.path.join(BASE_DIR, 'password.env'),
        os.path.join(BASE_DIR, 'email.env'),
        os.path.join(os.getcwd(), '.env'),
        os.path.join(os.getcwd(), 'password.env'),
    ]
    loaded = []
    for env_file in env_files:
        if os.path.exists(env_file):
            load_dotenv(env_file, override=True)
            loaded.append(env_file)

    # Clean common copy/paste mistakes: spaces in Gmail app passwords, quotes.
    for key in ['SMTP_EMAIL', 'SMTP_PASSWORD', 'SENDER_EMAIL', 'SENDER_APP_PASSWORD', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_PASSWORD', 'OWNER_EMAIL']:
        value = os.environ.get(key)
        if value is not None:
            value = value.strip().strip('"').strip("'")
            if key in ['SMTP_PASSWORD', 'SENDER_APP_PASSWORD', 'EMAIL_PASS', 'EMAIL_PASSWORD']:
                value = value.replace(' ', '')
            os.environ[key] = value
    return loaded

LOADED_ENV_FILES = load_email_environment()
DB_PATH = os.path.join(BASE_DIR, 'store.db')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 60 * 1024 * 1024
CORS(app)

SECRET_KEY = os.environ.get('ADMIN_SECRET_KEY', 'change-this-secret-key-for-production')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
# default password: admin12345
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH') or generate_password_hash(os.environ.get('ADMIN_PASSWORD', 'admin12345'))
ALLOWED_IMAGE_EXTENSIONS = {'png','jpg','jpeg','webp','gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4','webm','mov','m4v'}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
SAREE_TYPES = ['Silk Saree','Pattu Saree','Cotton Saree','Kanchi Pattu','Banarasi Saree','Wedding Saree','Party Wear Saree','Half Saree','Organza Saree','Georgette Saree','Chiffon Saree','Linen Saree','Designer Saree','Daily Wear Saree','Kalamkari Saree','Printed Saree','Embroidery Saree','Soft Silk Saree','Fancy Saree','Mysore Silk Saree','Paithani Saree','Bandhani Saree','Patola Saree','Sambalpuri Saree','Kerala Kasavu Saree','Tissue Saree','Tussar Silk Saree','Uppada Saree','Gadwal Saree','Dharmavaram Saree']
DEFAULT_SETTINGS = {
    'shop_phone': '918639153979',
    'owner_email': 'Durgaprasadkonda@gmail.com',
    'payment_phone': '918639153979',
    'upi_id': '',
    'shop_address': 'Sanivarapupeta, Eluru, Andhra Pradesh - 534003',
    'offers': json.dumps([
        {'title': 'New Arrivals', 'text': 'Fresh silk and pattu sarees now available', 'image': 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80', 'filter_types': []},
        {'title': 'Premium Silk', 'text': 'Kanchipuram, Banarasi & Wedding Sarees', 'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80', 'filter_types': ['Kanchi Pattu', 'Banarasi Saree', 'Pattu Saree', 'Wedding Saree']},
        {'title': 'All Silk Sarees', 'text': 'Festival & premium collection', 'image': 'https://images.unsplash.com/photo-1618375520434-0b7d1f8f6d19?auto=format&fit=crop&w=900&q=80', 'filter_types': ['Silk Saree', 'Soft Silk Saree', 'Mysore Silk Saree', 'Tussar Silk Saree']},
        {'title': 'Cotton Sarees', 'text': 'Summer & everyday comfort', 'image': 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?auto=format&fit=crop&w=900&q=80', 'filter_types': ['Cotton Saree', 'Linen Saree']}
    ]),
    'hero_slides': json.dumps([
        {'img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg', 'label':'Kanchipuram Collection'},
        {'img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg', 'label':'Premium Silk Sarees'},
        {'img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg', 'label':'Bridal Wedding Sarees'},
        {'img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mysore_Silk_Saree.jpg', 'label':'Mysore Silk Sarees'},
        {'img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Banarasi_Silk_Saree.jpg', 'label':'Banarasi Silk Sarees'}
    ]),
    'featured_collections': json.dumps([
        {'type':'Silk Saree','label':'Silk Sarees','sub':'Timeless elegance','img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg'},
        {'type':'Wedding Saree','label':'Wedding Sarees','sub':'For your big day','img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg'},
        {'type':'Kanchi Pattu','label':'Kanchi Pattu','sub':'Temple classics','img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg'},
        {'type':'Cotton Saree','label':'Cotton Sarees','sub':'Daily comfort','img':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_sarees.jpg'}
    ]),
    'discount_sections': json.dumps([
        {'slug': 'new-arrival-discount', 'title': 'New Arrival Discount', 'text': 'Fresh arrivals with special launch pricing', 'image': 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80', 'discount_percent': 10, 'filter_types': [], 'product_ids': []},
        {'slug': 'wedding-picks', 'title': 'Wedding Picks', 'text': 'Pattu, Kanchivaram and wedding sarees for special days', 'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80', 'discount_percent': 12, 'filter_types': ['Pattu Saree', 'Kanchi Pattu', 'Wedding Saree'], 'product_ids': []},
        {'slug': 'premium-silk-discount', 'title': 'Premium Silk Discount', 'text': 'Offers on Kanchi, Banarasi and wedding silk sarees', 'image': 'https://images.unsplash.com/photo-1618375520434-0b7d1f8f6d19?auto=format&fit=crop&w=900&q=80', 'discount_percent': 15, 'filter_types': ['Kanchi Pattu', 'Banarasi Saree', 'Pattu Saree', 'Wedding Saree'], 'product_ids': []},
        {'slug': 'summer-discount', 'title': 'Summer Discount', 'text': 'Cool comfort offers for summer wear', 'image': 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?auto=format&fit=crop&w=900&q=80', 'discount_percent': 8, 'filter_types': ['Cotton Saree', 'Linen Saree'], 'product_ids': []}
    ])
}

SAMPLE_PRODUCTS = [
    ('Royal Maroon Silk Saree', 1499, 'Sarees', 'Silk Saree', 'Free Size', 'Maroon', 'Free delivery', 'Rich south Indian silk saree with a festive sheen and elegant zari-inspired border.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg'),
    ('Emerald Brocade Pattu Saree', 1899, 'Sarees', 'Pattu Saree', 'Free Size', 'Emerald Green', 'Free delivery', 'Traditional brocade pattu saree for engagements, poojas, and family celebrations.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Green_brocade_silk_saree.jpg'),
    ('Ivory Everyday Cotton Saree', 799, 'Sarees', 'Cotton Saree', 'Free Size', 'Ivory & Black', 'Free delivery', 'Soft cotton saree with a clean drape for office, travel, and daily comfort.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_sarees.jpg'),
    ('Kanchipuram Temple Border Saree', 2299, 'Sarees', 'Kanchi Pattu', 'Free Size', 'Magenta & Gold', 'Free delivery', 'Classic Kanchi pattu look with a bold contrast border and grand occasion feel.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg'),
    ('Banarasi Gold Weave Saree', 2499, 'Sarees', 'Banarasi Saree', 'Free Size', 'Red & Gold', 'Free delivery', 'Banarasi silk style saree with woven motifs and a premium festive finish.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Banarasi_Silk_Saree.jpg'),
    ('Bridal Koorai Wedding Saree', 3199, 'Sarees', 'Wedding Saree', 'Free Size', 'Crimson', 'Free delivery', 'Wedding-ready koorai silk saree styling with a graceful bridal color story.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg'),
    ('Rose Gold Party Wear Saree', 1599, 'Sarees', 'Party Wear Saree', 'Free Size', 'Rose Gold', 'Free delivery', 'Lightweight party saree with a polished drape for receptions and evening events.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_3.jpg'),
    ('Youthful Half Saree Set', 1399, 'Sarees', 'Half Saree', 'Free Size', 'Pink & Violet', 'Free delivery', 'Bright half saree styling for festive days, college functions, and ceremonies.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_4.jpg'),
    ('Pearl Organza Saree', 1299, 'Sarees', 'Organza Saree', 'Free Size', 'Pearl White', 'Free delivery', 'Sheer organza-inspired saree with a soft, modern boutique look.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree_2.jpg'),
    ('Mysore Zari Silk Saree', 2699, 'Sarees', 'Mysore Silk Saree', 'Free Size', 'Gold', 'Free delivery', 'Mysore silk saree style with a refined zari finish for premium gifting.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mysore_Silk_Saree.jpg'),
    ('Assam Tussar Heritage Saree', 1799, 'Sarees', 'Tussar Silk Saree', 'Free Size', 'Cream & Red', 'Free delivery', 'Heritage tussar-style saree with earthy texture and handcrafted charm.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Traditional_Assam_silk_saree.jpg'),
    ('Sambalpuri Festive Saree', 1699, 'Sarees', 'Sambalpuri Saree', 'Free Size', 'Black & Red', 'Free delivery', 'Traditional patterned saree look for festive and cultural occasions.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/South_Silk_Saree.jpg')
]


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = db()
    conn.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        saree_type TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        delivery TEXT,
        description TEXT,
        image TEXT NOT NULL,
        images TEXT,
        video TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.execute('''CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        street TEXT,
        village TEXT,
        city TEXT,
        pincode TEXT,
        payment_method TEXT DEFAULT 'Cash on Delivery',
        payment_phone TEXT,
        upi_id TEXT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        status TEXT DEFAULT 'New',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.execute('''CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )''')
    conn.execute('''CREATE TABLE IF NOT EXISTS admin_users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    # Add new product media columns to older databases automatically
    existing_product_cols = [r['name'] for r in conn.execute('PRAGMA table_info(products)').fetchall()]
    for col, col_type in [('images', 'TEXT'), ('video', 'TEXT')]:
        if col not in existing_product_cols:
            conn.execute(f'ALTER TABLE products ADD COLUMN {col} {col_type}')

    # Add new order/payment columns to older databases automatically
    existing_order_cols = [r['name'] for r in conn.execute('PRAGMA table_info(orders)').fetchall()]
    for col, col_type in [
        ('street', 'TEXT'),
        ('village', 'TEXT'),
        ('city', 'TEXT'),
        ('pincode', 'TEXT'),
        ('payment_method', "TEXT DEFAULT 'Cash on Delivery'"),
        ('payment_phone', 'TEXT'),
        ('upi_id', 'TEXT')
    ]:
        if col not in existing_order_cols:
            conn.execute(f'ALTER TABLE orders ADD COLUMN {col} {col_type}')

    admin_exists = conn.execute('SELECT username FROM admin_users WHERE username=?', (ADMIN_USERNAME,)).fetchone()
    if not admin_exists:
        conn.execute('INSERT INTO admin_users (username,password_hash) VALUES (?,?)', (ADMIN_USERNAME, ADMIN_PASSWORD_HASH))
    for key, value in DEFAULT_SETTINGS.items():
        exists = conn.execute('SELECT key FROM settings WHERE key=?', (key,)).fetchone()
        if not exists:
            conn.execute('INSERT INTO settings (key,value) VALUES (?,?)', (key, value))
    conn.commit(); conn.close()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

def allowed_video(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

def save_uploaded_file(file):
    filename = secure_filename(file.filename)
    unique = f"{int(time.time())}_{secrets.token_hex(4)}_{filename}"
    file.save(os.path.join(UPLOAD_FOLDER, unique))
    return f'/static/uploads/{unique}'

def sign_token(payload):
    data = json.dumps(payload, separators=(',', ':')).encode()
    b64 = base64.urlsafe_b64encode(data).decode().rstrip('=')
    sig = hmac.new(SECRET_KEY.encode(), b64.encode(), hashlib.sha256).digest()
    sig64 = base64.urlsafe_b64encode(sig).decode().rstrip('=')
    return f'{b64}.{sig64}'

def verify_token(token):
    if not token: return False
    token = token.replace('Bearer ', '')
    try:
        b64, sig64 = token.split('.')
        expected = hmac.new(SECRET_KEY.encode(), b64.encode(), hashlib.sha256).digest()
        got = base64.urlsafe_b64decode(sig64 + '=' * (-len(sig64) % 4))
        if not hmac.compare_digest(expected, got): return False
        data = base64.urlsafe_b64decode(b64 + '=' * (-len(b64) % 4))
        payload = json.loads(data)
        return payload.get('exp', 0) > time.time()
    except Exception:
        return False

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not verify_token(request.headers.get('Authorization')):
            return jsonify({'message':'Admin login required'}), 401
        return fn(*args, **kwargs)
    return wrapper

def row_product(r):
    d = dict(r)
    try:
        d['images'] = json.loads(d.get('images') or '[]')
    except Exception:
        d['images'] = []
    if d.get('image') and d['image'] not in d['images']:
        d['images'] = [d['image']] + d['images']
    return d

def is_owner_product(product):
    media = [product.get('image')] + (product.get('images') or [])
    return any(str(item or '').startswith('/static/uploads/') for item in media)

def owner_products_from_rows(rows):
    return [product for product in [row_product(r) for r in rows] if is_owner_product(product)]

def clean_product_ids(value):
    ids = []
    for raw_id in value or []:
        try:
            pid = int(raw_id)
        except Exception:
            continue
        if pid > 0 and pid not in ids:
            ids.append(pid)
    return ids

def clean_discount_sections(sections):
    clean_sections = []
    for section in (sections or [])[:8]:
        title = (section.get('title') or '').strip()
        slug = (section.get('slug') or title.lower().replace('&', 'and').replace(' ', '-')).strip()
        text = (section.get('text') or '').strip()
        image = (section.get('image') or '').strip()
        try:
            discount_percent = int(float(section.get('discount_percent') or 0))
        except Exception:
            discount_percent = 0
        discount_percent = max(0, min(discount_percent, 95))
        filter_types = []
        for saree_type in section.get('filter_types') or []:
            saree_type = str(saree_type or '').strip()
            if saree_type and saree_type not in filter_types:
                filter_types.append(saree_type)
        product_ids = clean_product_ids(section.get('product_ids') or [])
        if title:
            clean_sections.append({
                'slug': slug or title.lower().replace(' ', '-'),
                'title': title,
                'text': text,
                'image': image,
                'discount_percent': discount_percent,
                'filter_types': filter_types,
                'product_ids': product_ids
            })
    return clean_sections

def merge_default_discount_sections(sections):
    existing_sections = clean_discount_sections(sections)
    sections_by_slug = {section.get('slug'): section for section in existing_sections}
    merged = []
    for default_section in clean_discount_sections(json.loads(DEFAULT_SETTINGS['discount_sections'])):
        slug = default_section.get('slug')
        merged.append({**default_section, **sections_by_slug.get(slug, {})})
    return merged

def discount_product(product, discount_percent):
    product = dict(product)
    discount_percent = max(0, min(int(discount_percent or 0), 95))
    price = int(product.get('price') or 0)
    product['discount_percent'] = discount_percent
    product['original_price'] = price
    product['discount_price'] = int(round(price * (100 - discount_percent) / 100))
    return product

def get_discount_sections_with_products():
    settings = get_settings_dict()
    sections = clean_discount_sections(settings.get('discount_sections') or [])
    conn = db()
    rows = conn.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
    conn.close()
    products_list = owner_products_from_rows(rows)
    products_by_id = {int(p['id']): p for p in products_list}
    out = []
    for section in sections:
        selected = []
        for pid in section.get('product_ids') or []:
            if pid in products_by_id:
                selected.append(products_by_id[pid])
        if not selected and section.get('filter_types'):
            allowed_types = set(section['filter_types'])
            selected = [p for p in products_list if p.get('saree_type') in allowed_types]
        if not selected and section.get('slug') == 'new-arrival-discount':
            selected = products_list[:8]
        section_out = dict(section)
        section_out['product_ids'] = [int(p['id']) for p in selected]
        section_out['products'] = [discount_product(p, section.get('discount_percent')) for p in selected]
        out.append(section_out)
    return out

def get_settings_dict():
    conn = db()
    rows = conn.execute('SELECT key,value FROM settings').fetchall()
    conn.close()
    settings = {r['key']: r['value'] for r in rows}
    try:
        offers = json.loads(settings.get('offers') or '[]')
    except Exception:
        offers = json.loads(DEFAULT_SETTINGS['offers'])
    try:
        hero_slides = json.loads(settings.get('hero_slides') or DEFAULT_SETTINGS['hero_slides'])
    except Exception:
        hero_slides = json.loads(DEFAULT_SETTINGS['hero_slides'])
    try:
        featured_collections = json.loads(settings.get('featured_collections') or DEFAULT_SETTINGS['featured_collections'])
    except Exception:
        featured_collections = json.loads(DEFAULT_SETTINGS['featured_collections'])
    try:
        discount_sections = merge_default_discount_sections(json.loads(settings.get('discount_sections') or DEFAULT_SETTINGS['discount_sections']))
    except Exception:
        discount_sections = merge_default_discount_sections(json.loads(DEFAULT_SETTINGS['discount_sections']))
    return {
        'shop_phone': settings.get('shop_phone') or DEFAULT_SETTINGS['shop_phone'],
        'owner_email': settings.get('owner_email') or DEFAULT_SETTINGS['owner_email'],
        'payment_phone': settings.get('payment_phone') or settings.get('shop_phone') or DEFAULT_SETTINGS['payment_phone'],
        'upi_id': settings.get('upi_id') or DEFAULT_SETTINGS['upi_id'],
        'shop_address': settings.get('shop_address') or DEFAULT_SETTINGS['shop_address'],
        'offers': offers,
        'hero_slides': hero_slides,
        'featured_collections': featured_collections,
        'discount_sections': discount_sections
    }

@app.route('/')
def health():
    return jsonify({'message':'VIGNESWARA SAREES backend running','port':5010})

@app.route('/saree-types')
def saree_types():
    return jsonify(SAREE_TYPES)


def get_admin_password_hash(username=ADMIN_USERNAME):
    conn = db()
    row = conn.execute('SELECT password_hash FROM admin_users WHERE username=?', (username,)).fetchone()
    conn.close()
    return row['password_hash'] if row else ADMIN_PASSWORD_HASH

def format_order_email(order_id, customer_name, phone, address, items, total, payment_method='Cash on Delivery', payment_phone='', upi_id='', street='', village='', city='', pincode=''):
    item_lines = []
    for item in items:
        qty = int(item.get('qty') or 1)
        price = int(float(item.get('price') or 0))
        item_lines.append(f"- {item.get('name','Product')} ({item.get('type','Saree')}) x {qty} = ₹{price * qty:,}")
    upi_note = 'Customer selected online UPI payment. Verify payment in PhonePe/Google Pay before shipping.' if payment_method != 'Cash on Delivery' else 'Customer selected Cash on Delivery.'
    return f"""New order received from Vigneswara Sarees.

Order ID: #{order_id}
Customer Name: {customer_name}
Phone: {phone}

Delivery Address:
Street / Door no / Landmark: {street or 'Not provided'}
Village / Area: {village or 'Not provided'}
City / Town: {city or 'Not provided'}
Pincode: {pincode or 'Not provided'}
Full Address: {address}

Payment Details:
Payment Method: {payment_method}
Payment Phone: {payment_phone or 'Not provided'}
UPI ID: {upi_id or 'Not provided'}
Payment Note: {upi_note}

Items:
{chr(10).join(item_lines)}

Total Amount: ₹{int(total):,}

Please open Owner Dashboard to update order status.
"""

def send_order_email(order_id, customer_name, phone, address, items, total, payment_method='Cash on Delivery', payment_phone='', upi_id='', street='', village='', city='', pincode=''):
    settings = get_settings_dict()
    owner_email = (
        os.environ.get('OWNER_EMAIL')
        or settings.get('owner_email')
        or DEFAULT_SETTINGS['owner_email']
    )
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    sender_email = (
        os.environ.get('SMTP_EMAIL')
        or os.environ.get('SENDER_EMAIL')
        or os.environ.get('EMAIL_USER')
        or os.environ.get('EMAIL_EMAIL')
    )
    sender_password = (
        os.environ.get('SMTP_PASSWORD')
        or os.environ.get('SENDER_APP_PASSWORD')
        or os.environ.get('EMAIL_PASS')
        or os.environ.get('EMAIL_PASSWORD')
    )
    subject = f"New Order #{order_id} - Vigneswara Sarees"
    body = format_order_email(order_id, customer_name, phone, address, items, total, payment_method, payment_phone, upi_id, street, village, city, pincode)

    if not sender_email or not sender_password:
        print('\n⚠️ Email notification not sent. Add SMTP_EMAIL+SMTP_PASSWORD OR EMAIL_USER+EMAIL_PASS in backend/.env or backend/password.env.')
        print('To:', owner_email)
        print('Subject:', subject)
        print(body)
        return {'sent': False, 'message': 'SMTP not configured'}

    msg = MIMEMultipart()
    msg['From'] = f"Vigneswara Sarees <{sender_email}>"
    msg['To'] = owner_email
    msg['Subject'] = subject
    msg['Reply-To'] = sender_email
    msg['X-Mailer'] = 'Vigneswara Sarees Order System'
    msg['X-Priority'] = '2'
    msg.attach(MIMEText(body, 'plain'))
    try:
        context = ssl.create_default_context()
        # First try Gmail SSL port 465. This is the most stable Gmail SMTP method.
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=30) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [owner_email], msg.as_string())
        print(f'✅ Email sent to {owner_email} for order #{order_id}')
        return {'sent': True, 'message': 'Email sent'}
    except Exception as e1:
        print('⚠️ Email SSL 465 failed:', e1)
        # Fallback to STARTTLS 587 if SSL is blocked by network/provider.
        try:
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=30) as server:
                server.ehlo()
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, [owner_email], msg.as_string())
            print(f'✅ Email sent to {owner_email} for order #{order_id} using STARTTLS 587')
            return {'sent': True, 'message': 'Email sent using STARTTLS'}
        except Exception as e2:
            print('⚠️ Email send failed on both 465 and 587.')
            print('465 error:', e1)
            print('587 error:', e2)
            print('Fix: generate a fresh Gmail App Password, confirm 2-Step Verification is ON, and try another internet network/hotspot if SMTP is blocked.')
            return {'sent': False, 'message': f'465: {e1}; 587: {e2}'}

@app.route('/settings', methods=['GET'])
def settings():
    return jsonify(get_settings_dict())

@app.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    data = request.get_json(silent=True) or {}
    current_settings = get_settings_dict()
    shop_phone = ''.join(ch for ch in str(data.get('shop_phone') or '') if ch.isdigit())
    owner_email = (data.get('owner_email') or DEFAULT_SETTINGS['owner_email']).strip()
    payment_phone = ''.join(ch for ch in str(data.get('payment_phone') or shop_phone) if ch.isdigit())
    upi_id = (data.get('upi_id') or '').strip()
    shop_address = (data.get('shop_address') or DEFAULT_SETTINGS['shop_address']).strip()
    offers = data.get('offers') or []
    hero_slides = data.get('hero_slides') or []
    featured_collections = data.get('featured_collections') or []
    discount_sections = data.get('discount_sections')
    clean_offers = []
    for offer in offers[:6]:
        title = (offer.get('title') or '').strip()
        text = (offer.get('text') or '').strip()
        image = (offer.get('image') or '').strip()
        if title or text or image:
            clean_offers.append({'title': title, 'text': text, 'image': image})
    clean_slides = []
    for slide in hero_slides[:8]:
        label = (slide.get('label') or '').strip()
        img = (slide.get('img') or '').strip()
        if label or img:
            clean_slides.append({'label': label, 'img': img})
    clean_featured = []
    for item in featured_collections[:8]:
        ctype = (item.get('type') or '').strip()
        label = (item.get('label') or '').strip()
        sub = (item.get('sub') or '').strip()
        img = (item.get('img') or '').strip()
        if ctype or label or sub or img:
            clean_featured.append({'type': ctype, 'label': label, 'sub': sub, 'img': img})
    if discount_sections is None:
        clean_discount = current_settings.get('discount_sections') or clean_discount_sections(json.loads(DEFAULT_SETTINGS['discount_sections']))
    else:
        clean_discount = clean_discount_sections(discount_sections)
    if not shop_phone:
        return jsonify({'message': 'Shop WhatsApp number is required'}), 400
    if not clean_offers:
        return jsonify({'message': 'At least one offer is required'}), 400
    if not clean_slides:
        clean_slides = json.loads(DEFAULT_SETTINGS['hero_slides'])
    if not clean_featured:
        clean_featured = json.loads(DEFAULT_SETTINGS['featured_collections'])
    if not clean_discount:
        clean_discount = clean_discount_sections(json.loads(DEFAULT_SETTINGS['discount_sections']))
    if '@' not in owner_email or '.' not in owner_email:
        return jsonify({'message': 'Valid owner email is required'}), 400
    if not payment_phone:
        return jsonify({'message': 'Payment phone number is required'}), 400
    conn = db()
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('shop_phone', shop_phone))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('owner_email', owner_email))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('payment_phone', payment_phone))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('upi_id', upi_id))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('shop_address', shop_address))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('offers', json.dumps(clean_offers)))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('hero_slides', json.dumps(clean_slides)))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('featured_collections', json.dumps(clean_featured)))
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('discount_sections', json.dumps(clean_discount)))
    conn.commit()
    conn.close()
    return jsonify(get_settings_dict())

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if username == ADMIN_USERNAME and check_password_hash(get_admin_password_hash(username), password):
        token = sign_token({'user': username, 'exp': time.time() + 60*60*8})
        return jsonify({'token': token, 'username': username})
    return jsonify({'message':'Invalid owner username or password'}), 401

@app.route('/admin/change-password', methods=['PUT'])
@admin_required
def change_admin_password():
    data = request.get_json(silent=True) or {}
    current_password = data.get('current_password') or ''
    new_password = data.get('new_password') or ''
    if not check_password_hash(get_admin_password_hash(), current_password):
        return jsonify({'message': 'Current password is wrong'}), 400
    if len(new_password) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400
    conn = db()
    conn.execute('UPDATE admin_users SET password_hash=?, updated_at=CURRENT_TIMESTAMP WHERE username=?', (generate_password_hash(new_password), ADMIN_USERNAME))
    conn.commit(); conn.close()
    return jsonify({'message': 'Password changed successfully'})

@app.route('/admin/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    settings = get_settings_dict()
    owner_email = settings.get('owner_email') or DEFAULT_SETTINGS['owner_email']
    
    if not email:
        return jsonify({'message': 'Email required'}), 400
    
    if email.lower() != owner_email.lower():
        return jsonify({'message': 'Email not registered as owner'}), 401

    default_password = 'admin12345'
    conn = db()
    conn.execute(
        'UPDATE admin_users SET password_hash=?, updated_at=CURRENT_TIMESTAMP WHERE username=?',
        (generate_password_hash(default_password), ADMIN_USERNAME)
    )
    conn.commit()
    conn.close()
    print(f'✅ Owner password reset to default for {owner_email}')
    return jsonify({
        'reset': True,
        'username': ADMIN_USERNAME,
        'password': default_password,
        'message': 'Password reset successfully. Login with admin / admin12345 and change it in Settings.'
    }), 200

@app.route('/products', methods=['GET'])
def products():
    conn = db()
    rows = conn.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify(owner_products_from_rows(rows))

@app.route('/discount-sections', methods=['GET'])
def discount_sections():
    return jsonify(get_discount_sections_with_products())

@app.route('/discount-sections', methods=['PUT'])
@admin_required
def update_discount_sections():
    data = request.get_json(silent=True) or {}
    if isinstance(data, list):
        raw_sections = data
    else:
        raw_sections = data.get('discount_sections', [])
    clean_sections = clean_discount_sections(raw_sections)
    if not clean_sections:
        return jsonify({'message': 'At least one discount section is required'}), 400

    requested_ids = []
    for section in clean_sections:
        requested_ids.extend(section.get('product_ids') or [])
    if requested_ids:
        placeholders = ','.join(['?'] * len(requested_ids))
        conn = db()
        rows = conn.execute(f'SELECT id FROM products WHERE id IN ({placeholders})', requested_ids).fetchall()
        conn.close()
        existing_ids = {int(r['id']) for r in rows}
        missing_ids = sorted(set(requested_ids) - existing_ids)
        if missing_ids:
            return jsonify({'message': 'Some selected products do not exist', 'missing_product_ids': missing_ids}), 400

    conn = db()
    conn.execute('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', ('discount_sections', json.dumps(clean_sections)))
    conn.commit()
    conn.close()
    return jsonify(get_discount_sections_with_products())

@app.route('/discount-sections/<slug>', methods=['GET'])
def discount_section(slug):
    slug = (slug or '').strip()
    for section in get_discount_sections_with_products():
        if section.get('slug') == slug:
            return jsonify(section)
    return jsonify({'message': 'Discount section not found'}), 404

@app.route('/search', methods=['GET'])
def search_products():
    query = (request.args.get('q') or '').strip().lower()
    conn = db()
    rows = conn.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
    conn.close()
    products_list = owner_products_from_rows(rows)
    if not query:
        return jsonify(products_list)

    def normalize(text):
        text = str(text or '').lower()
        text = text.replace('sarees', 'saree').replace('kanchipuram', 'kanchi').replace('kanchee', 'kanchi').replace('banarsi', 'banarasi').replace('mysuru', 'mysore').replace('pattu', 'silk pattu')
        cleaned = []
        for ch in text:
            cleaned.append(ch if ch.isalnum() else ' ')
        return ' '.join(''.join(cleaned).split())

    def edit_distance(a, b):
        # Small fuzzy matcher for spelling mistakes like kanchi/kanchee, banarasi/banarsi.
        if not a or not b:
            return max(len(a), len(b))
        if abs(len(a) - len(b)) > 2:
            return 3
        prev = list(range(len(b) + 1))
        for i, ca in enumerate(a, 1):
            cur = [i]
            for j, cb in enumerate(b, 1):
                cur.append(min(cur[-1] + 1, prev[j] + 1, prev[j-1] + (ca != cb)))
            prev = cur
        return prev[-1]

    def score_product(product):
        q = normalize(query)
        tokens = [t for t in q.split() if t]
        fields = {
            'name': normalize(product.get('name')),
            'type': normalize(product.get('saree_type')),
            'color': normalize(product.get('color')),
            'description': normalize(product.get('description')),
            'category': normalize(product.get('category')),
        }
        combined = ' '.join(fields.values())
        combined_words = combined.split()
        score = 0
        if fields['name'] == q: score += 250
        if fields['type'] == q: score += 220
        if fields['color'] == q: score += 140
        if fields['name'].startswith(q): score += 120
        if fields['type'].startswith(q): score += 110
        if q in fields['name']: score += 90
        if q in fields['type']: score += 80
        if q in fields['color']: score += 60
        if q in combined: score += 35

        for token in tokens:
            if token in fields['name'].split(): score += 55
            elif token in fields['name']: score += 35
            if token in fields['type'].split(): score += 50
            elif token in fields['type']: score += 30
            if token in fields['color'].split(): score += 30
            elif token in fields['color']: score += 18
            if token in fields['description']: score += 10
            # fuzzy token match for small typo
            for word in combined_words:
                if len(token) >= 4 and edit_distance(token, word) <= 1:
                    score += 18
                    break
        return score

    matched = []
    for product in products_list:
        score = score_product(product)
        if score > 0:
            product['search_score'] = score
            matched.append(product)
    matched.sort(key=lambda p: (p.get('search_score', 0), -int(p.get('price') or 0)), reverse=True)
    return jsonify(matched)

@app.route('/shop-info', methods=['GET'])
def shop_info():
    settings = get_settings_dict()
    return jsonify({
        'name': 'Vigneswara Sarees',
        'address': settings.get('shop_address') or DEFAULT_SETTINGS['shop_address'],
        'phone': settings.get('shop_phone') or DEFAULT_SETTINGS['shop_phone'],
        'owner_email': settings.get('owner_email') or DEFAULT_SETTINGS['owner_email'],
        'payment_phone': settings.get('payment_phone') or DEFAULT_SETTINGS['payment_phone'],
        'upi_id': settings.get('upi_id') or DEFAULT_SETTINGS['upi_id']
    })

@app.route('/products', methods=['POST'])
@admin_required
def add_product():
    # multipart/form-data only for real image upload
    name = (request.form.get('name') or '').strip()
    price = (request.form.get('price') or '').strip()
    category = (request.form.get('category') or 'Sarees').strip()
    saree_type = (request.form.get('saree_type') or '').strip()
    size = (request.form.get('size') or 'Free Size').strip()
    color = (request.form.get('color') or '').strip()
    delivery = (request.form.get('delivery') or 'Free delivery').strip()
    description = (request.form.get('description') or '').strip()
    image_files = request.files.getlist('images') or []
    legacy_image = request.files.get('image')
    if legacy_image and legacy_image.filename:
        image_files = [legacy_image] + image_files
    video = request.files.get('video')
    if not name or not price or not saree_type or not color:
        return jsonify({'message':'Name, price, saree type and color are required'}), 400
    try:
        price_int = int(float(price))
        if price_int <= 0: raise ValueError()
    except Exception:
        return jsonify({'message':'Price must be a valid number'}), 400
    image_paths = []
    for img in image_files:
        if not img or not img.filename:
            continue
        if not allowed_image(img.filename):
            return jsonify({'message':'Only PNG, JPG, JPEG, WEBP, GIF images allowed'}), 400
        image_paths.append(save_uploaded_file(img))
    if not image_paths:
        return jsonify({'message':'Please upload at least one saree photo'}), 400
    video_path = ''
    if video and video.filename:
        if not allowed_video(video.filename):
            return jsonify({'message':'Only MP4, WEBM, MOV, M4V videos allowed'}), 400
        video_path = save_uploaded_file(video)
    image_path = image_paths[0]
    conn = db()
    cur = conn.execute('''INSERT INTO products (name,price,category,saree_type,size,color,delivery,description,image,images,video)
                          VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
                       (name, price_int, category, saree_type, size, color, delivery, description, image_path, json.dumps(image_paths), video_path))
    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute('SELECT * FROM products WHERE id=?', (new_id,)).fetchone()
    conn.close()
    return jsonify(row_product(row)), 201

@app.route('/products/<int:pid>', methods=['PUT'])
@admin_required
def update_product(pid):
    name = (request.form.get('name') or '').strip()
    price = (request.form.get('price') or '').strip()
    category = (request.form.get('category') or 'Sarees').strip()
    saree_type = (request.form.get('saree_type') or '').strip()
    size = (request.form.get('size') or 'Free Size').strip()
    color = (request.form.get('color') or '').strip()
    delivery = (request.form.get('delivery') or 'Free delivery').strip()
    description = (request.form.get('description') or '').strip()
    if not name or not price or not saree_type or not color:
        return jsonify({'message':'Name, price, saree type and color are required'}), 400
    try: price_int = int(float(price))
    except Exception: return jsonify({'message':'Price must be valid'}), 400
    conn = db()
    old = conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone()
    if not old:
        conn.close(); return jsonify({'message':'Product not found'}), 404
    image_path = old['image']
    try:
        image_paths = json.loads(old['images'] or '[]') if 'images' in old.keys() else []
    except Exception:
        image_paths = []
    if image_path and image_path not in image_paths:
        image_paths = [image_path] + image_paths
    image_files = request.files.getlist('images') or []
    legacy_image = request.files.get('image')
    if legacy_image and legacy_image.filename:
        image_files = [legacy_image] + image_files
    if image_files:
        new_paths = []
        for img in image_files:
            if not img or not img.filename:
                continue
            if not allowed_image(img.filename):
                conn.close(); return jsonify({'message':'Only PNG, JPG, JPEG, WEBP, GIF images allowed'}), 400
            new_paths.append(save_uploaded_file(img))
        if new_paths:
            image_paths = new_paths
            image_path = image_paths[0]
    video_path = old['video'] if 'video' in old.keys() else ''
    video = request.files.get('video')
    if video and video.filename:
        if not allowed_video(video.filename):
            conn.close(); return jsonify({'message':'Only MP4, WEBM, MOV, M4V videos allowed'}), 400
        video_path = save_uploaded_file(video)
    conn.execute('''UPDATE products SET name=?,price=?,category=?,saree_type=?,size=?,color=?,delivery=?,description=?,image=?,images=?,video=? WHERE id=?''',
                 (name,price_int,category,saree_type,size,color,delivery,description,image_path,json.dumps(image_paths),video_path,pid))
    conn.commit()
    row = conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone()
    conn.close()
    return jsonify(row_product(row))

@app.route('/products/<int:pid>', methods=['DELETE'])
@admin_required
def delete_product(pid):
    conn = db(); conn.execute('DELETE FROM products WHERE id=?', (pid,)); conn.commit(); conn.close()
    return jsonify({'message':'Deleted'})

@app.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json(silent=True) or {}
    customer_name = (data.get('customer_name') or '').strip()
    phone = (data.get('phone') or '').strip()
    street = (data.get('street') or '').strip()
    village = (data.get('village') or '').strip()
    city = (data.get('city') or '').strip()
    pincode = (data.get('pincode') or '').strip()
    payment_method = (data.get('payment_method') or 'Cash on Delivery').strip()
    settings = get_settings_dict()
    payment_phone = (data.get('payment_phone') or settings.get('payment_phone') or settings.get('shop_phone') or '').strip()
    upi_id = (data.get('upi_id') or settings.get('upi_id') or '').strip()
    address = (data.get('address') or '').strip()
    if not address:
        address_parts = [street, village, city, pincode]
        address = ', '.join([p for p in address_parts if p])
    items = data.get('items') or []
    total = int(data.get('total') or 0)
    if not customer_name or not phone or not street or not village or not city or not pincode or not items:
        return jsonify({'message':'Name, phone, street, village, city, pincode and cart items are required'}), 400
    allowed_payments = ['Cash on Delivery', 'PhonePe / Google Pay / UPI']
    if payment_method not in allowed_payments:
        payment_method = 'Cash on Delivery'
    conn = db()
    cur = conn.execute("""INSERT INTO orders
        (customer_name,phone,address,street,village,city,pincode,payment_method,payment_phone,upi_id,items,total)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (customer_name,phone,address,street,village,city,pincode,payment_method,payment_phone,upi_id,json.dumps(items),total))
    conn.commit(); oid = cur.lastrowid; conn.close()
    email_result = send_order_email(oid, customer_name, phone, address, items, total, payment_method, payment_phone, upi_id, street, village, city, pincode)
    return jsonify({'message':'Order confirmed successfully','order_id':oid,'status':'New','email':email_result}), 201

@app.route('/orders', methods=['GET'])
@admin_required
def get_orders():
    conn = db(); rows = conn.execute('SELECT * FROM orders ORDER BY id DESC').fetchall(); conn.close()
    out=[]
    for r in rows:
        d=dict(r)
        try: d['items']=json.loads(d['items'])
        except Exception: pass
        out.append(d)
    return jsonify(out)

@app.route('/static/uploads/<path:filename>')
def uploaded(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/orders/track', methods=['GET'])
def track_order():
    phone = (request.args.get('phone') or '').strip()
    if not phone:
        return jsonify({'message': 'Phone number required'}), 400
    conn = db()
    rows = conn.execute('SELECT * FROM orders WHERE phone=? ORDER BY id DESC', (phone,)).fetchall()
    conn.close()
    out = []
    for r in rows:
        d = dict(r)
        try: d['items'] = json.loads(d['items'])
        except: pass
        out.append(d)
    return jsonify(out)


@app.route('/orders/<int:oid>/status', methods=['PUT'])
@admin_required
def update_order_status(oid):
    data = request.get_json(silent=True) or {}
    status = (data.get('status') or '').strip()
    allowed = ['New', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
    if status not in allowed:
        return jsonify({'message': f'Status must be one of: {", ".join(allowed)}'}), 400
    conn = db()
    conn.execute('UPDATE orders SET status=? WHERE id=?', (status, oid))
    conn.commit()
    row = conn.execute('SELECT * FROM orders WHERE id=?', (oid,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'message': 'Order not found'}), 404
    d = dict(row)
    try: d['items'] = json.loads(d['items'])
    except: pass
    return jsonify(d)

init_db()

if __name__ == '__main__':
    configured_email = (os.environ.get('SMTP_EMAIL') or os.environ.get('EMAIL_USER') or os.environ.get('SENDER_EMAIL') or '')
    configured_pass = (os.environ.get('SMTP_PASSWORD') or os.environ.get('EMAIL_PASS') or os.environ.get('SENDER_APP_PASSWORD') or '')
    print('✅ VIGNESWARA SAREES Backend running at http://localhost:5010')
    print('📁 Env files loaded:', LOADED_ENV_FILES if LOADED_ENV_FILES else 'NONE FOUND')
    print('📧 Email sender loaded:', configured_email if configured_email else 'NOT SET')
    print('🔑 Email app password loaded:', 'YES' if configured_pass else 'NO')
    app.run(host='0.0.0.0', port=5010, debug=True)
