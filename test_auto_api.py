import requests
import random
import string

def run(base):
    print('--- Testing', base, '---')
    s = requests.Session()
    login_url = base + '/api/auth/login/'
    payload = {'username':'admin','password':'Admin1234'}
    r = s.post(login_url, json=payload)
    print('LOGIN', r.status_code, r.reason)
    print('LOGIN cookies', dict(s.cookies))
    if r.status_code != 200:
        print('Login failed:', r.text)
        return
    csrf = s.cookies.get('csrftoken')
    if csrf:
        s.headers.update({'X-CSRFToken': csrf})
    users_url = base + '/api/users/'
    r = s.get(users_url)
    print('GET users', r.status_code)
    if r.status_code == 200:
        print('Users count', len(r.json()) if isinstance(r.json(), list) else 'not list', r.text[:200])
    else:
        print('GET failed', r.text)
    username = 'auto_test_' + ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
    create_payload = {
        'username': username,
        'email': username + '@example.com',
        'first_name': 'Auto',
        'last_name': 'Test',
        'password': 'observer001',
        'role': 'observateur'
    }
    r = s.post(users_url, json=create_payload)
    print('CREATE user', r.status_code, r.text[:300])
    if r.status_code not in (200, 201):
        return
    obj = r.json()
    user_id = obj.get('id')
    if not user_id:
        print('No user id in create response')
        return
    patch_url = users_url + str(user_id) + '/'
    r = s.patch(patch_url, json={'first_name': 'AutoPatched'})
    print('PATCH', r.status_code, r.text[:200])
    r = s.delete(patch_url)
    print('DELETE', r.status_code, r.text[:200])

for base in ['http://localhost:8001', 'http://localhost:5173']:
    run(base)
