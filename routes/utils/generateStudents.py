import names
import string
import random
import time

characters = list(string.ascii_letters + string.digits)
random.seed(time.time())
years = ['1','2','3','4']
bedtimes = [10,11,12,1,2]
majorList=[]
cleanliness = ["Clean", "Messy", "Dirty", "Dont care", "Messy and Dirty", "Dirty and Messy", "Little bit of both", "Only clean", "Pig stye", "I am clean", "I am ditry", "Lived in"]
with open("majors.txt", "r") as majors:
	majorList.append(majors.readlines());
majors.close()
majors = []
for m in majorList[0]:
	majors.append(m.strip())

musicList=[]
with open("musics.txt", "r") as musics:
	musicList.append(musics.readlines());
musics.close()
musics = []
for m in musicList[0]:
	musics.append(m.strip())

def generate_random_password():
	## length of password from the user
	length = int(random.randrange(10,20))

	## shuffling the characters
	random.shuffle(characters)
	
	## picking random characters from the list
	password = []
	for i in range(length):
		password.append(random.choice(characters))

	## shuffling the resultant password
	random.shuffle(password)

	## converting the list to string
	## printing the list
	return ("".join(password))

def generate_random_phonenumber():
	ph_no = []
	ph_no.append(str(random.randint(6, 9))) 
	for i in range(1, 10):
		ph_no.append(str(random.randint(0, 9)))
	return ("".join(ph_no))

f = open("students.txt", "w")
for i in range(5000):
	ID = 30000 + i
	password = generate_random_password()
	first = names.get_first_name()
	last = names.get_last_name()
	phone = generate_random_phonenumber()
	email = "{}.{}@school.edu".format(last,first)
	isRA = 1 if random.uniform(0,1) > 0.9 else 0
	year = years[int(3*random.uniform(0,1))]
	major = majors[int(99*random.uniform(0,1))]
	music = musics[int(99*random.uniform(0,1))]
	bedtime = bedtimes[int(4*random.uniform(0,1))]
	clean = cleanliness[int(11*random.uniform(0,1))]
	line = "{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}\n".format(ID, password, first, last, phone, email, isRA, year, major, music, bedtime, clean)
	f.write(line)
f.close()
