from Pyfhel import Pyfhel

HE = Pyfhel()
HE.contextGen(p=65537)
HE.keyGen()


def secure_add(a: int, b: int) -> int:
    encrypted_a = HE.encryptInt(a)
    encrypted_b = HE.encryptInt(b)
    return HE.decryptInt(encrypted_a + encrypted_b)
