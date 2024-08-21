# Nathan Holmes-King
# 2024-06-16

import bz2
import csv
from datetime import datetime
from datetime import timezone
import json
import os
import re
import sys
import time

"""
Command-line arugments:
1. Data dump filename
2. Index filename
"""


def isBanned(w, fromStart=False):
    """
    Is item on banned list?
    """
    bannedInt = []
    if fromStart:
        bannedinf = open('banned_interests.csv', 'r')
        lesari = csv.reader(bannedinf)
        for a in lesari:
            if a[0][0] != 'Q':
                continue
            bannedInt.append(int(a[0][1:]))
        bannedinf.close()
    else:
        bannedinf = open('wdcache/b', 'rb')
        bytelist = bannedinf.read()
        n = 0
        while n < len(bytelist):
            bannedInt.append(int.from_bytes(bytelist[n:n+4], 'little'))
            n += 4
        bannedinf.close()
    if int(w['id'][1:]) in bannedInt:
        return True
    cache = {}
    props = [31,  # instance of
             106,  # occupation
             279,  # subclass of
             361,  # part of
             463,  # member of
             749,  # parent organization
             1142,  # political ideology
             1269,  # facet of
             1557,  # manifestation of
             ]
    for p in props:
        try:
            for a in w['claims']['P' + str(p)]:
                if a['mainsnak']['datavalue']['value']['numeric-id'] in \
                   bannedInt and a['rank'] != 'deprecated':
                    return True
        except KeyError:
            continue
    return False


def raw2json_c(w):
    """
    Get trimmed JSON for property value encoding.
    """
    r = {}
    try:
        w['claims']
    except KeyError:
        return r
    for a in w['claims']:
        for b in w['claims'][a]:
            if b['mainsnak']['snaktype'] != 'value' or \
               b['mainsnak']['datavalue']['type'] != 'wikibase-entityid' or \
               b['mainsnak']['datavalue']['value']['entity-type'] != 'item':
                continue
            if b['rank'] == 'normal':
                t = (b['mainsnak']['datavalue']['value']['numeric-id'], 2)
            elif b['rank'] == 'preferred':
                t = (b['mainsnak']['datavalue']['value']['numeric-id'], 4)
            elif b['rank'] == 'deprecated':
                t = (b['mainsnak']['datavalue']['value']['numeric-id'], 1)
            try:
                r[a].append(t)
            except KeyError:
                r[a] = [t]
    return r


def raw2json_t(w):
    """
    Get trimmed JSON for labels and descriptions encoding.
    """
    r = {}
    try:
        w['labels']
    except KeyError:  # Item is redirect
        return r
    ll = json.load(open('wdcache/langList.json', 'r'))
    r['labels'] = {}
    for a in ll:
        if a in w['labels']:
            r['labels'][a] = w['labels'][a]['value']
    r['descriptions'] = {}
    for a in ll:
        if a in w['descriptions']:
            r['descriptions'][a] = w['descriptions'][a]['value']
    if len(w['claims']) == 0:
        r['banned'] = False
        return r
    # Unicode character
    try:
        r['uc'] = w['claims']['P487'][0]['mainsnak']['datavalue']['value']
    except KeyError:
        pass
    r['banned'] = isBanned(w)
    return r


def encode_c(rjs):
    """
    Encode property values of items.

    Following constraints:
    - Q value is 4 bytes (4.3e9)
    - P value is 3 bytes (1.7e7)
    - Little endian
    """
    mx = max(rjs)
    try:
        outfile = open('wdcache/c', 'r+b')
        outfile.seek(0, os.SEEK_END)
        n = outfile.tell()
        outfile.seek(n)
    except FileNotFoundError:
        outfile = open('wdcache/c', 'wb')
        outfile.write((0).to_bytes(1, 'little'))  # Dummy byte, index != 0
        n = 1
    try:
        indexfile = open('wdcache/i_c', 'r+b')
        indexfile.seek(0, os.SEEK_END)
        if indexfile.tell() == 0:
            i = 0
            indexfile.seek(0)
        else:
            i = indexfile.tell() // 5 - 1
            indexfile.seek(indexfile.tell() - 5)
    except FileNotFoundError:
        indexfile = open('wdcache/i_c', 'wb')
        i = 0
    if i > min(rjs):
        print('ATTENTION!', i, min(rjs))
    while i <= mx:
        try:
            a = rjs[i]
        except KeyError:
            indexfile.write((0).to_bytes(5, 'little'))
            i += 1
            continue
        indexfile.write(n.to_bytes(5, 'little'))
        for b in a:
            outfile.write(int(b[1:]).to_bytes(3, 'little'))
            n += 3
            for c in a[b]:
                outfile.write(c[0].to_bytes(4, 'little'))
                outfile.write(c[1].to_bytes(1, 'little'))
                n += 5
            outfile.write((0).to_bytes(4, 'little'))
            n += 4
        i += 1
    indexfile.write(n.to_bytes(5, 'little'))  # Dummy index for EOF
    outfile.close()
    indexfile.close()


def decode_c(q):
    """
    Decode property values of given item.
    """
    dexfile = open('wdcache/i_c', 'rb')
    dexfile.seek(q * 5)
    i = int.from_bytes(dexfile.read(5), 'little')
    if i == 0:
        return {}
    j = 0
    while j == 0:
        j = int.from_bytes(dexfile.read(5), 'little')
    infile = open('wdcache/c', 'rb')
    infile.seek(i)
    com = infile.read(j-i)
    infile.close()
    r = {}
    n = 0
    mode = 1
    while n < len(com):
        if mode == 1:  # Property
            if int.from_bytes(com[n:n+4], 'little') == 0:
                mode = 2
                n += 3
                continue
            p = 'P' + str(int.from_bytes(com[n:n+3], 'little'))
            r[p] = []
            mode = 2
            n += 3
        elif mode == 2:  # Value
            if int.from_bytes(com[n:n+4], 'little') == 0:
                mode = 1
                n += 4
                continue
            r[p].append((int.from_bytes(com[n:n+4], 'little'),
                         int.from_bytes(com[n+4:n+5], 'little')))
            n += 5
    return r


def encode_t(rjs):
    """
    Encode labels and descriptions.
    """
    ll = json.load(open('wdcache/langList.json', 'r'))
    mx = max(rjs)
    try:
        outfile = open('wdcache/t', 'r+b')
        outfile.seek(0, os.SEEK_END)
        n = outfile.tell()
        outfile.seek(n)
    except FileNotFoundError:
        outfile = open('wdcache/t', 'wb')
        outfile.write((0).to_bytes(1, 'little'))  # Dummy byte, index != 0
        n = 1
    try:
        indexfile = open('wdcache/i_t', 'r+b')
        indexfile.seek(0, os.SEEK_END)
        if indexfile.tell() == 0:
            i = 0
            indexfile.seek(0)
        else:
            i = indexfile.tell() // 5 - 1
            indexfile.seek(indexfile.tell() - 5)
    except FileNotFoundError:
        indexfile = open('wdcache/i_t', 'wb')
        i = 0
    while i <= mx:
        # On banned list?
        try:
            a = rjs[i]
            a['banned']
        except KeyError:
            indexfile.write((0).to_bytes(5, 'little'))
            i += 1
            continue
        indexfile.write(n.to_bytes(5, 'little'))
        outfile.write(a['banned'].to_bytes(1, 'little'))
        # Unicode character
        n += 1
        try:
            ba = bytearray(a['uc'], 'utf-8')
            outfile.write(ba)
            n += len(ba)
        except KeyError:
            pass
        outfile.write((0).to_bytes(2, 'little'))
        # Labels and descriptions
        n += 2
        for lang in ll:
            ba = bytearray(lang, 'utf-8')
            outfile.write(ba)
            n += len(ba)
            outfile.write((0).to_bytes(1, 'little'))
            n += 1
            try:
                ba = bytearray(a['labels'][lang], 'utf-8')
                outfile.write(ba)
                n += len(ba)
            except KeyError:
                pass
            outfile.write((0).to_bytes(1, 'little'))
            n += 1
            try:
                ba = bytearray(a['descriptions'][lang], 'utf-8')
                outfile.write(ba)
                n += len(ba)
            except KeyError:
                pass
            outfile.write((0).to_bytes(2, 'little'))
            n += 2
        i += 1
    indexfile.write(n.to_bytes(5, 'little'))  # Dummy index for EOF
    outfile.close()
    indexfile.close()


def decode_t(q):
    """
    Decode labels and descriptions of given item.
    """
    dexfile = open('wdcache/i_t', 'rb')
    dexfile.seek(q * 5)
    i = int.from_bytes(dexfile.read(5), 'little')
    if i == 0:
        return {}
    j = 0
    while j == 0:
        j = int.from_bytes(dexfile.read(5), 'little')
    infile = open('wdcache/t', 'rb')
    infile.seek(i)
    com = infile.read(j-i)
    infile.close()
    r = {}
    r['labels'] = {}
    r['descriptions'] = {}
    r['banned'] = bool.from_bytes(com[0:1], 'little')
    n = 1
    m = 1
    while bool.from_bytes(com[m:m+1], 'little'):
        m += 1
    if m > n:
        r['uc'] = com[n:m].decode('utf-8')
    n = m + 2
    m = n
    langCode = ''
    while n < len(com):
        # Language code
        while bool.from_bytes(com[m:m+1], 'little'):
            m += 1
        langCode = com[n:m].decode('utf-8')
        n = m + 1
        m = n
        # Label
        while bool.from_bytes(com[m:m+1], 'little'):
            m += 1
        cd = com[n:m].decode('utf-8')
        if len(cd) > 0:
            r['labels'][langCode] = cd
        n = m + 1
        m = n
        # Description
        while bool.from_bytes(com[m:m+1], 'little'):
            m += 1
        cd = com[n:m].decode('utf-8')
        if len(cd) > 0:
            r['descriptions'][langCode] = cd
        n = m + 2
        m = n
    return r


def cache(dumpname, indexname):
    """
    Iterate thru files to generate cache.
    """
    start = time.time()
    dumpfile = open(dumpname, 'rb')
    indexfile = open(indexname, 'rb')
    index = bz2.decompress(indexfile.read()).decode('utf-8').split('\n')
    indexfile.close()
    c = {}
    t = {}
    offset = -1
    next_off = -1
    bzcache = None
    dumpfile.seek(int(index[0].split(':')[0]))
    i = 0
    n = 0
    m = 0
    while i < len(index):
        if i % 1000 == 0:
            print(i)
        s = index[i].split(':')
        if len(s) < 3:  # New line at EOF
            i += 1
            continue
        if int(s[0]) != offset:  # New stream
            offset = int(s[0])
            try:
                j = i + 1
                while int(index[j].split(':')[0]) == offset:
                    j += 1
                next_off = int(index[j].split(':')[0])
                bz = dumpfile.read(next_off - offset)
            except ValueError:  # Last stream in file
                bz = dumpfile.read()
            bzcache = bz2.decompress(bz).decode('utf-8')
            n = 0
            m = 0
        try:
            if s[2][0] != 'Q':  # Non-item page
                i += 1
                continue
            # Find start of JSON text
            q = int(s[2][1:])
            while bzcache[n:n+len(s[2])+15] != '<title>' + s[2] + '</title>':
                n += 1
            while n < len(bzcache)-5 and bzcache[n:n+5] != '<text':
                if bzcache[n:n+10] == '<revision>':
                    n += 164
                if bzcache[n:n+7] == '<model>':
                    n += 23
                if bzcache[n:n+8] == '<format>':
                    n += 27
                n += 1
            # Find end of JSON text
            jlen = 0
            while n < len(bzcache) and bzcache[n] != '>':
                if bzcache[n:n+7] == 'bytes="':
                    n += 7
                    k = n
                    while bzcache[k] != '"':
                        k += 1
                    jlen = int(bzcache[n:k])
                    n = k
                n += 1
            n += 1
            m = n + jlen
            while bzcache[m] != '>':
                m += 2
            # m will end up at "</text>" or "<sha1>"
            # Closing angle brackets are always 19 spaces apart
            while bzcache[m:m+7] != '</text>':
                m -= 1
            rjs = bzcache[n:m]
            rjs = rjs.replace('&quot;', '"')
            rjd = json.loads(rjs)
            c[q] = raw2json_c(rjd)
            t[q] = raw2json_t(rjd)
            n = m + 7
            i += 1
        except IndexError:
            i += 1
            continue
        except ValueError:
            i += 1
            continue
    encode_c(c)
    encode_t(t)
    dumpfile.close()
    try:
        progrep = open('cache_progress.csv', 'r')
        progrep.close()
        progrep = open('cache_progress.csv', 'a')
    except FileNotFoundError:
        progrep = open('cache_progress.csv', 'w')
        progrep.write('Dump,Start,End,Time (UTC)')
    ds = dumpname.split('/')[-1].split('-')
    r = '\n' + ds[1] + ','
    p = ds[5].split('.')[0].split('p')
    r += p[1] + ',' + p[2] + ','
    progrep.write(r + str(datetime.now(timezone.utc)))
    progrep.close()
    print(time.time() - start)


if __name__ == '__main__':
    if len(sys.argv) == 2:
        start = time.time()
        print(decode_t(int(sys.argv[1])))
        print(time.time() - start)
    elif len(sys.argv) == 3:
        cache(sys.argv[1], sys.argv[2])
