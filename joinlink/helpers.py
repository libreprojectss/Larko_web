from cryptography.fernet import Fernet


def encrypt_user_id(user_id,key):
    fernet = Fernet(key)
    print(key)
    data= fernet.encrypt(str(user_id).encode())
    print(data)
    return data

def decrypt_user_id(encrypted_user_id,key):
    fernet = Fernet(key)
    encrypted_user_id=encrypted_user_id[2:-1]  # Remove the "b'" prefix and the "'" suffix
    print(encrypted_user_id)
    return fernet.decrypt(encrypted_user_id.encode()).decode()