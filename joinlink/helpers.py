from cryptography.fernet import Fernet


def encrypt_user_id(user_id,key):
    fernet = Fernet(key)
    print(key)
    data= fernet.encrypt(str(user_id).encode())
    return data.decode('utf-8')

def decrypt_user_id(encrypted_user_id,key):
    fernet = Fernet(key)
    print(encrypted_user_id)
    return fernet.decrypt(encrypted_user_id.encode()).decode()