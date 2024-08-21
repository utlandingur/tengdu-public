from datetime import datetime
from datetime import timedelta
from datetime import timezone
import firebase_admin
from flask import Flask
import json
import math
import numpy as np
import pywikibot
from pywikibot import pagegenerators
import random
from requests import get
import sys
import wdcache

app = Flask(__name__)

cred_obj = firebase_admin.credentials.Certificate("./tengdu-testing.json")
try:
    default_app = firebase_admin.initialize_app(
        cred_obj,
        {
            "apiKey": "----",
            "authDomain": "----",
            "projectId": "----",
            "storageBucket": "----",
            "messagingSenderId": "----",
            "appId": "----",
            "measurementId": "----"
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


def geoDist(c1, c2):
    """
    Return the geographic distance between two lat/lon pairs.
    """
    if c1[0] == c2[0] and c1[1] == c2[1]:
        return 0
    return 6371 * math.acos(math.sin(math.radians(c1[0])) *
                            math.sin(math.radians(c2[0])) +
                            math.cos(math.radians(c1[0])) *
                            math.cos(math.radians(c2[0])) *
                            math.cos(math.radians(abs(c1[1] - c2[1]))))


def googleMapsTime(ulist, datestamp):
    """
    Find Google Maps travel time using hub-and-spoke model.

    datestamp = string in YYYYMMDD format
    """
    newdate = datetime.strptime(datestamp, '%Y%m%d')
    num = int(np.sqrt(len(ulist)))
    ulistf = list(ulist)
    new = False
    # Load cache of previous hub-and-spoke data
    try:
        hubcf = open('mapscache/h', 'rb')
        olddate = datetime.strptime(hubcf.read(8).decode('utf-8'), '%Y%m%d')
        if (newdate - olddate).days >= 28:
            new = True
    except FileNotFoundError:
        new = True
    # Load information on transfer stations
    try:
        tjf = open('mapscache/transitHubs.json', 'r')
        tjs = json.load(tjf)
        tjf.close()
    except FileNotFoundError:
        pass
    # Assign hubs
    if new:
        # Select first hub at random
        x = random.randrange(len(ulistf))
        hubChoice = [ulistf[x]]
        # Find distance between each user and first hub
        distFromHub = {}
        for a in ulist:
            distFromHub[a] = geoDist(ulist[a]['coords'],
                                     ulist[ulistf[x]]['coords'])
        # Find distance from every user to every other user
        distb = {}
        for a in ulist:
            distb[a] = {}
        for a in ulist:
            for b in ulist:
                gd = geoDist(ulist[a]['coords'], ulist[b]['coords'])
                distb[a][b] = gd
                distb[b][a] = gd
        # Main loop
        while len(hubChoice) < num:
            # Calculate weights for each hub
            hubWeight = []
            for a in ulist:
                d_a = distFromHub[a]
                if d_a == 0:
                    continue
                w = []
                # Distance to other users
                for b in ulist:
                    if a == b:
                        continue
                    d_b = distb[a][b]
                    if d_b == 0:
                        continue
                    if d_b > d_a:
                        w.append(0)
                    elif d_b < 0.5:
                        w.append(math.log(2*d_a)-1)
                    else:
                        w.append(min(max(0, math.log(d_a/d_b)-1),
                                     math.log(2*d_a)-1))
                wt = sum(w)
                # Distance to transfer stations
                for n in tjs['n']:
                    gdn = max(geoDist(ulist[a]['coords'], n), 0.1)
                    wt *= (math.atan(gdn) * 2 / math.pi) **\
                          (tjs['n'][n][0] / tjs['n'][n][1] - 1)
                    for t in tjs['t'][n]:
                        gdt = max(geoDist(ulist[a]['coords'], t), 0.1)
                        wt *= (gdn / gdt) ** (tjs['t'][n][t] / tjs['n'][n][1])
                hubWeight.append((a, wt))
            # Find hub with highest weight
            hubWeight.sort(key=lambda x: x[1], reverse=True)
            hubChoice.append(hubWeight[0][0])
            for a in ulist:
                newd = geoDist(ulist[a]['coords'],
                               ulist[hubWeight[0][0]]['coords'])
                if newd < distFromHub[a]:
                    distFromHub[a] = newd
        # Calculate travel time between hubs
        hubs = -np.ones((num, num), dtype=np.int32)
        for i in range(hubs.shape(0)):
            hubs[i][i] = 0
        i = 0
        while i < hubs.shape(0):
            j = 0
            while j < hubs.shape(1):
                if i == j:
                    j += 1
                    continue
                # API KEY NEEDED
                response = get('https://maps.googleapis.com/maps/api/'
                               'distancematrix/json?travelMode=TRANSIT&'
                               'destinations=' +
                               ulist[hubChoice[j]]['location'] + '&origins=' +
                               ulist[hubChoice[i]]['location'] + '&key=' +
                               API_KEY).content.json()
                leid = response['rows'][0]['elements'][0]
                if leid['status'] != 'OK':
                    j += 1
                    continue
                hubs[i][j] = leid['duration']['value']
                j += 1
            i += 1
    else:
        pass  # TEMP
    # Find closest hub to each user ("spoke")
    spokeDist = {}
    for a in ulistf:
        dList = []
        i = 0
        while i < len(hubChoice):
            b = hubChoice[i]
            dList.append((i, geoDist(ulist[b]['coords'], ulist[a]['coords'])))
            i += 1
        dList.sort(key=lambda x: x[1])
        spokeDist[a] = dList
    # Calculate travel time from each spoke to its hub
    spokes = []
    transferStops = {}
    hubCount = {}
    for a in ulistf:
        i = 0
        badHubs = []  # Hubs that spoke can't get to at all
        while i < len(spokeDist[a]):
            hcsd = hubChoice[spokeDist[a][i][0]]
            if a == hubChoice[spokeDist[a][i][0]]:
                spokes.append([hcsd, 0, 0])
                break
            if i in badHubs:
                i += 1
                continue
            # API KEY NEEDED
            respFrom = get('https://maps.googleapis.com/maps/api/'
                           'directions/json?travelMode=TRANSIT&destination=' +
                           ulist[hubChoice[spokeDist[a][i][0]]]['location'] +
                           '&origin=' + ulist[a]['location'] + '&key=' +
                           API_KEY).content.\
                        json()['routes'][0]['legs'][0]['steps']
            respTo = get('https://maps.googleapis.com/maps/api/'
                         'directions/json?travelMode=TRANSIT&destination=' +
                         ulist[a]['location'] + '&origin=' +
                         ulist[hubChoice[spokeDist[a][i][0]]]['location'] +
                         '&key=' + API_KEY).content.\
                        json()['routes'][0]['legs'][0]['steps']
            if len(respFrom) == 0 or len(respTo) == 0:  # Can't get to hub
                badHubs.append(i)
                for j in range(i+1, hubs.shape(0)):
                    if hubs[i][j] != -1 and hubs[j][i] != -1:
                        badHubs.append(j)
                i += 1
                continue
            # Travel time
            depTiFr = datetime.strptime(respFrom[0]['departureTime']+'+0000',
                                        '%Y-%m-%dT%H:%M:%SZ%z')
            depTiTo = datetime.strptime(respTo[0]['departureTime']+'+0000',
                                        '%Y-%m-%dT%H:%M:%SZ%z')
            arrTiFr = datetime.strptime(respFrom[0]['arrivalTime']+'+0000',
                                        '%Y-%m-%dT%H:%M:%SZ%z')
            arrTiTo = datetime.strptime(respTo[0]['arrivalTime']+'+0000',
                                        '%Y-%m-%dT%H:%M:%SZ%z')
            durFr = arrTiFr - depTiFr
            durTo = arrTiTo - depTiTo
            # Filter non-transit directions
            k = 0
            while k < len(respFrom):
                if 'transitDetails' not in respFrom[k]:
                    del respFrom[k]
                else:
                    k += 1
            k = 0
            while k < len(respTo):
                if 'transitDetails' not in respTo[k]:
                    del respTo[k]
                else:
                    k += 1
            try:
                transferStops[hcsd]
            except KeyError:
                transferStops[hcsd] = {}
            # Find transfer stations
            k = 0
            while k < len(respFrom):
                step = respFrom[k]
                trans_det = step['transitDetails']
                if k > 0:
                    depart = trans_det['departureStop']
                else:
                    depart = None
                if k < len(respFrom - 1):
                    arrive = trans_det['arrivalStop']
                else:
                    arrive = None
                if depart:
                    coord = (depart['location']['latLng']['latitude'],
                             depart['location']['latLng']['longitude'])
                    try:
                        transferStops[hcsd][coord] += 1
                    except KeyError:
                        transferStops[hcsd][coord] = 1
                if arrive:
                    coord = (arrive['location']['latLng']['latitude'],
                             arrive['location']['latLng']['longitude'])
                    try:
                        transferStops[hcsd][coord] += 1
                    except KeyError:
                        transferStops[hcsd][coord] = 1
                k += 1
            k = 0
            while k < len(respFrom):
                step = respFrom[k]
                trans_det = step['transitDetails']
                if k > 0:
                    depart = trans_det['departureStop']
                else:
                    depart = None
                if k < len(respFrom - 1):
                    arrive = trans_det['arrivalStop']
                else:
                    arrive = None
                if depart:
                    coord = (depart['location']['latLng']['latitude'],
                             depart['location']['latLng']['longitude'])
                    try:
                        transferStops[hcsd][coord] += 1
                    except KeyError:
                        transferStops[hcsd][coord] = 1
                if arrive:
                    coord = (arrive['location']['latLng']['latitude'],
                             arrive['location']['latLng']['longitude'])
                    try:
                        transferStops[hcsd][coord] += 1
                    except KeyError:
                        transferStops[hcsd][coord] = 1
                k += 1
            spokes.append([spokeDist[a][i][0], durFr.total_seconds(),
                           durTo.total_seconds()])
            try:
                hubCount[hcsd] += 1
            except KeyError:
                hubCount[hcsd] = 1
            break
        if len(badHubs) == len(spokeDist[a]):  # Spoke can't get to any hubs
            hubs = np.concatenate([hubs, -np.ones((1, hubs.shape(1)),
                                                  dtype=np.int32)], axis=0)
            hubs = np.concatenate([hubs, -np.ones((hubs.shape(0), 1),
                                                  dtype=np.int32)], axis=1)
            hubs[hubs.shape(0)][hubs.shape(1)] = 0
            spokes.append([len(hubChoice), 0, 0])
            for b in spokeDist:
                spokeDist[b].append((len(hubChoice),
                                     geoDist(ulist[b]['coords'],
                                             ulist[a]['coords'])))
                spokeDist[b].sort(key=lambda x: x[1])
            hubChoice.append(a)
    # Consolidate info on transfer stations
    numTransfers = {}
    for a in transferStops:
        for b in transferStops[a]:
            try:
                numTransfers[a][0] += transferStops[a][b]
            except KeyError:
                numTransfers[a] = [transferStops[a][b], 0]
    for a in spokes:
        try:
            numTransfers[hubChoice[a[0]]][1] += 1
        except KeyError:
            numTransfers[hubChoice[a[0]]][1] = [0, 1]
    tjf = open('mapscache/transitHubs.json', 'w')
    json.dump({'n': numTransfers, 's': transferStops}, tjf, indent=4)
    tjf.close()
    return {'hubChoice': hubChoice, 'hubs': hubs, 'ulistf': ulistf,
            'spokes': np.array(spokes, dtype=np.int32)}


def searchWD(term, lang, amt, genImg=False):
    """
    Input a search term, and return the top N results from Wikidata.

    No issues with Wikimedia server timeouts.
    """
    searchTime = datetime.now(timezone.utc)
    site = pywikibot.Site('wikidata')
    g = False
    try:
        search = json.load(open('wdcache/s_' + lang + '.json', 'r'))
        oldTime = datetime.strptime(search[term]['time'],
                                    '%Y-%m-%d %H:%M:%S.%f%z')
        if (searchTime - oldTime).days >= 30:
            g = True
        else:
            pg = []
            for a in search[term]['results']:
                pg.append('[[wikidata:Q' + str(a) + ']]')
    except FileNotFoundError:
        g = True
    except KeyError:
        g = True
    if g:  # Search not found in cache
        pg = pagegenerators. \
             WikibaseSearchItemPageGenerator(term, language=lang, total=amt,
                                             site=site)
    r = []
    for a in pg:
        qid = str(a)[11:-2]
        num = int(qid[1:])
        item = wdcache.decode_t(num)
        if item == {}:
            continue
        try:
            banned = item['banned']
        except KeyError:
            banned = False
        if banned:
            continue
        try:
            r.append((num, item['labels'][lang]['value'],
                      item['descriptions'][lang]['value']))
        except KeyError:
            try:
                r.append((num, item['labels']['en']['value'] + ' [en]',
                          item['descriptions']['en']['value']))
            except KeyError:
                r.append(num, '[' + qid + ']', '')
    out.close()
    if g:  # Search not found in cache
        dic = {}
        dic['results'] = []
        for a in r:
            dic['results'].append(a[0])
        dic['time'] = str(searchTime)
        try:
            ojs = json.load(open('wdcache/s_' + lang + '.json', 'r'))
        except FileNotFoundError:
            ojs = {}
        ojs[term] = dic
        json.dump(ojs, open('wdcache/s_' + lang + '.json', 'w'), indent=4)
    # Generate images of UI
    if genImg:
        out = open('demo_imgs/d_' + term + '_' + lang + '_' + str(amt) +
                   '.svg', 'w')
        # Background
        out.write('<!DOCTYPE svg>\n<svg width="400" height="800" '
                  'xmlns="http://www.w3.org/2000/svg" '
                  'xmlns:xlink="http://www.w3.org/1999/xlink">')
        out.write('\n\t<rect x="0" y="0" width="400" height="800" '
                  'fill="#fff" stroke="#000" stroke-width="5"/>')
        out.write('\n\t<text x="25" y="75" font-family="sans-serif" '
                  'font-size="50" fill="#000">')
        if lang == 'en':
            out.write('Interests')
        elif lang == 'is':
            out.write('Áhugamál')
        out.write('</text>')
        # Search bar
        out.write('\n\t<rect x="25" y="100" width="350" height="40" '
                  'fill="#fff" stroke="#ccc" stroke-width="1"/>')
        out.write('\n\t<text x="35" y="130" font-family="sans-serif" '
                  'font-size="25" fill="#888">')
        out.write(term)
        out.write('</text>')
        # Search results
        n = 0
        while n < len(r):
            out.write('\n\t<rect x="25" y="' + str(140 + 65 * n) +
                      '" width="350" height="65" fill="')
            if r[n][3]:
                out.write('#faa')
            else:
                out.write('#fff')
            out.write('" stroke="#000" stroke-width="1"/>')
            out.write('\n\t<text x="35" y="' + str(175 + 65 * n) +
                      '" font-family="sans-serif" font-size="25" '
                      'fill="#000">')
            out.write(r[n][1])
            out.write('</text>')
            out.write('" stroke="#000" stroke-width="1"/>')
            out.write('\n\t<text x="35" y="' + str(195 + 65 * n) +
                      '" font-family="sans-serif" font-size="10" '
                      'fill="#555">')
            out.write(r[n][2])
            out.write('</text>')
            n += 1
        out.write('\n</svg>')
        out.close()
    return r


def displayWD(qid, lang):
    """
    Return the item label and an optional emoji.
    """
    item = wdcache.decode_t(qid)
    try:
        if 'uc' in item:  # Unicode character
            return item['labels'][lang] + ' ' + item['uc']
        else:
            return item['labels'][lang]
    except KeyError:
        return '[Q' + str(qid) + ']'


def matchTwo(u1, u2, ulist=None):
    """
    Calculate the match score for two users.
    u1 and u2 = string user IDs
    """
    if ulist is None:
        ulist = users()
    mjson = {}
    mjson['score'] = 1
    mjson['matchedUsers'] = (u1, u2)
    # Gender
    mjson['genders'] = (ulist[u1]['gender'], ulist[u2]['gender'])
    if ulist[u1]['gender'] not in ulist[u2]['matching']['gender'] or \
       ulist[u2]['gender'] not in ulist[u1]['matching']['gender']:
        mjson['score'] = 0
        return mjson
    # Age
    cd = datetime.now()
    age1 = (cd - ulist[u1]['dateOfBirth']).years
    age2 = (cd - ulist[u2]['dateOfBirth']).years
    mjson['ages'] = (age1, age2)
    if age2 < ulist[u1]['matching']['ageFrom'] or \
       age2 > ulist[u1]['matching']['ageTo'] or \
       age1 < ulist[u2]['matching']['ageFrom'] or \
       age1 > ulist[u2]['matching']['ageTo']:
        mjson['score'] = 0
        return mjson
    # Location
    mjson['locations'] = (ulist[u1]['location'], ulist[u2]['location'])
    d = geoDist(ulist[u1]['coords'], ulist[u2]['coords'])
    if d > max(ulist[u1]['maxDist'], ulist[u2]['maxDist']):  # Too far apart
        mjson['score'] = 0
        return mjson
    # Availability
    mjson['sharedAvailability'] = {}
    f = False  # Are there ANY matching days & times?
    for a in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',
              'saturday', 'sunday']:
        mjson['sharedAvailability'][a] = {}
        for b in ['morning', 'afternoon', 'evening']:
            avail = (ulist[u1]['availability'][a][b] and
                     ulist[u2]['availability'][a][b])
            if avail:
                f = True
            mjson['sharedAvailability'][a][b] = avail
    if not f:
        mjson['score'] = 0
        return mjson
    # Interests
    cache = {}
    for a in ulist[u1]['interests']:
        try:
            cache[a]
        except KeyError:
            cache[a] = wdcache.decode_c(a)
    for b in ulist[u2]['interests']:
        try:
            cache[b]
        except KeyError:
            cache[b] = wdcache.decode_c(b)
    mjson['sharedInterests'] = []
    for a in ulist[u1]['interests']:
        for b in ulist[u2]['interests']:
            if a == b:
                mjson['sharedInterests'].append((a, b, 1))
                continue
            ts = 0
            c1 = cache[a]
            c2 = cache[b]
            for p in c1:
                for i in c1[p]:
                    if i[0] == b:
                        ts += i[1] / 2
                        continue
                    for j in c2[p]:
                        if j[0] == i[0]:
                            ts += j[1] * i[1] / 4
            for p in c2:
                for j in c2[p]:
                    if j[0] == a:
                        ts += j[1] / 2
            mjson['sharedInterests'].append((a, b, 2 * math.atan(ts / 5) /
                                             math.pi))
    mjson['score'] *= sum([x[2] for x in mjson['sharedInterests']])
    if mjson['score'] == 0:
        return mjson
    return mjson


def matchTwo_beta(u1, u2, ulist=None):
    """
    Calculate the match score for two users.
    u1 and u2 = string user IDs
    """
    if ulist is None:
        ulist = users()
    mjson = {}
    mjson['score'] = 1
    mjson['matchedUsers'] = (u1, u2)
    # Gender
    mjson['genders'] = (ulist[u1]['gender'], ulist[u2]['gender'])
    if ulist[u1]['gender'] not in ulist[u2]['matching']['gender'] or \
       ulist[u2]['gender'] not in ulist[u1]['matching']['gender']:
        mjson['score'] = 0
        return mjson
    # Age
    cd = datetime.now()
    age1 = (cd - ulist[u1]['dateOfBirth']).years
    age2 = (cd - ulist[u2]['dateOfBirth']).years
    mjson['ages'] = (age1, age2)
    if age2 < ulist[u1]['matching']['ageFrom'] or \
       age2 > ulist[u1]['matching']['ageTo'] or \
       age1 < ulist[u2]['matching']['ageFrom'] or \
       age1 > ulist[u2]['matching']['ageTo']:
        mjson['score'] = 0
        return mjson
    # Location
    mjson['locations'] = (ulist[u1]['location'], ulist[u2]['location'])
    d = geoDist(ulist[u1]['coords'], ulist[u2]['coords'])
    if d > max(ulist[u1]['maxDist'], ulist[u2]['maxDist']):  # Too far apart
        f = False
        for a in ulist[u1]['POIList']:
            if a['interest'] in ulist[u2]['interests']:
                dp = geoDist(a['coords'], ulist[u2]['coords'])
                if dp <= ulist[u2]['maxDist']:
                    f = True
                    break
        for a in ulist[u2]['POIList']:
            if a['interest'] in ulist[u1]['interests']:
                dp = geoDist(a['coords'], ulist[u1]['coords'])
                if dp <= ulist[u1]['maxDist']:
                    f = True
                    break
        if not f:
            mjson['score'] = 0
            return mjson
    # Availability
    mjson['sharedAvailability'] = {}
    f = False  # Are there ANY matching days & times?
    for a in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',
              'saturday', 'sunday']:
        mjson['sharedAvailability'][a] = {}
        for b in ['morning', 'afternoon', 'evening']:
            avail = (ulist[u1]['availability'][a][b] and
                     ulist[u2]['availability'][a][b])
            if avail:
                f = True
            mjson['sharedAvailability'][a][b] = avail
    if not f:
        mjson['score'] = 0
        return mjson
    # Interests
    cache = {}
    for a in ulist[u1]['interests']:
        try:
            cache[a]
        except KeyError:
            cache[a] = wdcache.decode_c(a)
    for b in ulist[u2]['interests']:
        try:
            cache[b]
        except KeyError:
            cache[b] = wdcache.decode_c(b)
    mjson['sharedInterests'] = []
    for a in ulist[u1]['interests']:
        for b in ulist[u2]['interests']:
            if a == b:
                mjson['sharedInterests'].append((a, b, 1))
                continue
            ts = 0
            c1 = cache[a]
            c2 = cache[b]
            for p in c1:
                for i in c1[p]:
                    if i[0] == b:
                        ts += i[1] / 2
                        continue
                    for j in c2[p]:
                        if j[0] == i[0]:
                            ts += j[1] * i[1] / 4
            for p in c2:
                for j in c2[p]:
                    if j[0] == a:
                        ts += j[1] / 2
            mjson['sharedInterests'].append((a, b, 2 * math.atan(ts / 5) /
                                             math.pi))
    mjson['score'] *= sum([x[2] for x in mjson['sharedInterests']])
    if mjson['score'] == 0:
        return mjson
    # Languages
    mjson['sharedLanguages'] = []
    pref1 = None
    pref2 = None
    for a in ulist[u1]['language']:
        if a['preferred']:
            pref1 = a
            break
    for b in ulist[u2]['language']:
        if b['preferred']:
            pref2 = b
            break
    if pref1 is not None and pref2 is not None and (pref1['code'] !=
                                                    pref2['code']):
        mjson['score'] = 0
        return mjson
    f = False
    for a in ulist[u1]['language']:
        for b in ulist[u2]['language']:
            if a['code'] != b['code']:
                continue
            mjson['sharedLanguages'].append({'code': a['code'],
                                             'level': min(a['level'],
                                                          b['level']),
                                             'preferred': (a['preferred'] or
                                                           b['preferred'])})
            if a['level'] > 1 and b['level'] > 1:
                f = True
    if not f:
        mjson['score'] = 0
        return mjson
    if pref1 is None and pref2 is None:
        return mjson
    if pref1 is None:
        f = True
        for a in ulist[u1]['language']:
            if a['code'] == pref2['code']:
                if a['level'] < 2:  # U1 does not speak preferred language
                    mjson['score'] = 0
                    return mjson
                elif a['level'] == 2:  # U1 is non-native speaker
                    mjson['score'] *= 0.5
                f = True
                break
        if not f:
            mjson['score'] = 0
            return mjson
        g = False
        for b in ulist[u2]['language']:
            if b['level'] == 3:
                for a in ulist[u1]['language']:
                    if a['code'] == b['code']:
                        if a['level'] > 1:  # U1 speaks U2's native language
                            g = True
                            break
            if g:
                break
        if not g:
            mjson['score'] *= 0.9
    elif pref2 is None:
        f = True
        for b in ulist[u2]['language']:
            if b['code'] == pref1['code']:
                if b['level'] < 2:  # U2 does not speak preferred language
                    mjson['score'] = 0
                    return mjson
                elif b['level'] == 2:  # U2 is non-native speaker
                    mjson['score'] *= 0.5
                f = True
                break
        if not f:
            mjson['score'] = 0
            return mjson
        g = False
        for a in ulist[u1]['language']:
            if a['level'] == 3:
                for b in ulist[u2]['language']:
                    if a['code'] == b['code']:
                        if b['level'] > 1:  # U2 speaks U1's native language
                            g = True
                            break
            if g:
                break
        if not g:
            mjson['score'] *= 0.9
    return mjson


def match(idList, ulist=None):
    """
    Compute match score for more than two users.
    idList = list of string user ids to match
    ulist = dict of user data
    """
    if len(idList) < 2:
        return 0
    if ulist is None:
        ulist = users()
    score = 0
    i = 1
    while i < len(idList):
        for a in idList[:i]:
            mjson = matchTwo(idList[i], a, ulist=ulist)
            if mjson['score'] == 0:
                return 0
            score *= mjson['score']
    # Group size
    for a in idList:
        if ulist[a]['groupSize'] < len(idList):
            score *= ulist[a]['groupSize'] / len(idList)
        elif ulist[a]['groupSize'] > len(idList):
            score *= len(idList) / ulist[a]['groupSize']
    return score ** (2 / (len(idList)**2 - len(idList)))  # Geometric mean


def bestMatch(user, amt, short=False):
    """
    Find best match in list of users.
    """
    ulist = users()
    maxscore = 0
    maxuser = []
    if short and len(ulist) > amt ** 2:
        ulistf = list(ulist)
        i = 0
        while i < len(ulistf):
            if ulistf[i] == user:
                del ulistf[i]
                break
            i += 1
        random.shuffle(ulistf)
        shortlist = ulistf[:amt ** 2]
        ulistf = ulistf[amt ** 2:]
        maxuser = []
        maxscore = 0
        i = 0
        while i < len(shortlist):
            a = shortlist[i]
            mjson = matchTwo(user, a, ulist=ulist)
            if mjson['score'] == 0 and len(ulistf) > 0:
                shortlist.append(ulistf[0])
                del ulistf[0]
            elif mjson['score'] > maxscore or (mjson['score'] == maxscore and
                                               len(maxuser) < amt):
                maxuser.append(mjson)
                maxuser.sort(key=lambda x: x['score'], reverse=True)
                maxuser = maxuser[:amt]
                maxscore = maxuser[-1]['score']
            i += 1
    else:
        for a in ulist:
            if a == user:
                continue
            mjson = matchTwo(user, a, ulist=ulist)
            if mjson['score'] > maxscore or (mjson['score'] == maxscore and
                                             len(maxuser) < amt):
                maxuser.append(mjson)
                maxuser.sort(key=lambda x: x['score'], reverse=True)
                maxuser = maxuser[:amt]
                maxscore = maxuser[-1]['score']
    return maxuser


def genMatch(ulistf=None):
    """
    Generate matches.
    """
    if ulistf is None:
        ulist = users()
        ulistf = list(ulist)
    random.shuffle(ulistf)
    odd = None
    if len(ulistf) <= size:
        if match(ulistf) == 0:
            print('ERROR! Could not match.')  # TEMP
            return 0  # TEMP
        else:
            return ulistf
    if len(ulistf) % size != 0:  # Odd number of users
        odd = ulistf[-(len(ulistf) % size):]
        ulistf = ulistf[:-(len(ulistf) % size)]
    matchlist = []
    i = 0
    while i < len(ulistf):
        matchlist.append(ulistf[i:i+size])
        i += size
    swaps = len(matchlist)
    zero = True
    while swaps >= len(matchlist) and zero:
        zero = False
        swaps = 0
        i = 0
        while i < len(ulistf):
            j = i + 1
            while j < len(ulistf):
                k = 0
                while k < size:
                    scoreFirst = match(matchlist[i], ulist=ulist)
                    scoreLast = match(matchlist[j], ulist=ulist)
                    scoreOuter = match(matchlist[i][:k] + [matchlist[j][k]] +
                                       matchlist[i][k+1:])
                    scoreInner = match(matchlist[j][:k] + [matchlist[i][k]] +
                                       matchlist[j][k+1:])
                    if min(scoreOuter, scoreInner) > \
                       max(scoreFirst, scoreLast):
                        temp = matchlist[i][k]
                        matchlist[i][k] = matchlist[j][k]
                        matchlist[j][k] = temp
                        swaps += 1
                    if scoreFirst == 0 or scoreLast == 0 or scoreOuter == 0 \
                       or scoreInner == 0:
                        zero = True
                    k += 1
                j += 1
            i += 1
        if swaps == 0 and zero:
            print('ERROR! Could not match.')  # TEMP
            return 0  # TEMP
    if odd is not None:
        for a in odd:
            maxi = -1
            maxscore = 0
            i = 0
            while i < len(matchlist):
                if len(matchlist[i]) > size:
                    i += 1
                    continue
                three = match(matchlist[i] + [a], ulist=ulist)
                if three > maxscore:
                    maxi = i
                    maxscore = score
                i += 1
            matchlist[maxi].append(odd)
        if maxscore == 0:
            print('ERROR! Could not match.')  # TEMP
            return 0  # TEMP
    return matchlist


def sepByLoc():
    """
    Assumes max radius of 100 km (increase to 1000 with Google Maps).
    """
    ulist = users()
    r = []
    for a in ulist:
        close = []
        i = 0
        while i < len(r):
            if r[i][0][0] > ulist[a]['coords'][0] + 1 or \
               r[i][0][1] < ulist[a]['coords'][0] - 1:
                i += 1
                continue
            for c in r[i][1:]:
                if geoDist(ulist[a]['coords'], ulist[c]['coords']) < \
                   max(ulist[a]['maxDist'], ulist[c]['maxDist']):
                    close.append(i)
                    break
            i += 1
        if len(close) == 0:
            r.append([[ulist[a]['coords'][0], ulist[a]['coords'][0]], a])
        elif len(close) == 1:
            r[close[0]].append(a)
            r[close[0]][0][0] = min(r[close[0]][0][0], ulist[a]['coords'][0])
            r[close[0]][0][1] = max(r[close[0]][0][1], ulist[a]['coords'][0])
        elif len(close) > 1:
            r[close[0]].append(a)
            r[close[0]][0][0] = min(r[close[0]][0][0], ulist[a]['coords'][0])
            r[close[0]][0][1] = max(r[close[0]][0][1], ulist[a]['coords'][0])
            j = len(close) - 1
            while j > 0:
                r[close[0]][0][0] = min(r[close[0]][0][0], r[close[j]][0][0])
                r[close[0]][0][1] = max(r[close[0]][0][1], r[close[j]][0][1])
                r[close[0]] += r[close[j]][1:]
                del r[close[j]]
                j -= 1
    return r


if __name__ == '__main__':
    r = sepByLoc()
    matches = []
    for a in r:
        gm = genMatch(ulistf=a)
        if type(gm) is list:
            matches += gm
        else:
            continue  # TEMP
