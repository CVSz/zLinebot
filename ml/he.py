from Pyfhel import Pyfhel

HE = Pyfhel()
HE.contextGen(p=65537)
HE.keyGen()


def encrypt(x):
    return HE.encryptInt(int(x))


def add(a, b):
    # encrypted addition
    return a + b


def decrypt(c):
    return HE.decryptInt(c)
