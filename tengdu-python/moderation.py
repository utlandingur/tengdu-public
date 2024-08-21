# Nathan Holmes-King
# 2024-06-13

import csv
from flask import Flask
import firebase_admin
import json
import os
import sys
import wdcache

"""
Command-line arguments:
1. Mode. 1 = add to base list; 2 = fill cache.
"""

try:
    app = Flask(__name__)

    cred_obj = firebase_admin.credentials.Certificate("./tengdu-testing.json")
    default_app = firebase_admin.initialize_app(
        cred_obj,
        {
            "apiKey": "----",
            "authDomain": "---",
            "projectId": "tengdu-testing",
            "storageBucket": "---",
            "messagingSenderId": "---",
            "appId": "----",
            "measurementId": "---",
        },
    )
except ValueError:
    pass

# We need to do the db imports after initializing the app
from db.users import get_users


@app.route("/users")
def users():
    users = get_users()
    return users


def addToBaseList(code):
    site = pywikibot.Site('wikidata')
    item = json.loads(pywikibot.Page(site, code).text)
    try:
        r = [code, item['labels']['en']['value'],
             item['descriptions']['en']['value']]
    except KeyError:
        r = [code, '[' + code + ']', '']
    if ',' in r[1]:
        r[1] = '"' + r[1] + '"'
    if ',' in r[2]:
        r[2] = '"' + r[2] + '"'
    try:
        outfile = open('banned_interests.csv', 'a')
    except FileNotFoundError:
        outfile = open('banned_interests.csv', 'w')
        outfile.write('Code,Label,Description')
    outfile.write('\n' + r[0] + ',' + r[1] + ',' + r[2])
    outfile.close()
    pruneBaseList()
    cachefile = open('wdcache/b', 'ab')
    cachefile.write(int(r[0][1:]).to_bytes(4, 'little'))
    cachefile.close()


def pruneBaseList():
    """
    Sort and remove duplicates from base list.
    """
    li = []
    di = {}
    infile = open('banned_interests.csv', 'r')
    lesari = csv.reader(infile)
    for a in lesari:
        if len(a) == 0 or len(a[0]) == 0 or a[0][0] != 'Q':
            continue
        if a[0] not in di:
            li.append(a)
        di[a[0]] = True
    infile.close()
    li.sort(key=lambda x: int(x[0][1:]))
    outfile = open('banned_interests.csv', 'w')
    ritari = csv.writer(outfile)
    ritari.writerow(['Code', 'Label', 'Description'])
    for a in li:
        ritari.writerow(a)
    outfile.close()


def fillCache():
    """
    Write extended list.
    """
    infile = open('wdcache/i_t', 'rb')
    infile.seek(0, os.SEEK_END)
    end = infile.tell() // 5 - 1
    infile.close()
    outfile = open('wdcache/b', 'wb')
    for i in range(end):
        if i % 1000 == 0:
            print(i)
        t = wdcache.decode_t(i)
        try:
            t['banned']
        except KeyError:
            continue
        if t['banned']:
            outfile.write(i.to_bytes(4, 'little'))
    outfile.close()


def checkUsers():
    ulist = users()
    for a in ulist:
        for b in ulist[a]['interests']:
            try:
                banned = wdcache.decode_t(b)['banned']
            except KeyError:
                continue
            if banned:
                break
        if banned:
            try:
                susList = open('sus_users.txt', 'r')
                susList.close()
                susList = open('sus_users.txt', 'a')
            except FileNotFoundError:
                susList = open('sus_users.txt', 'w')
            susList.write(a + '\n')
            susList.close()


if __name__ == '__main__':
    if sys.argv[1] == '1':
        addToBaseList(input('ID: '))
    elif sys.argv[1] == '2':
        fillCache()
