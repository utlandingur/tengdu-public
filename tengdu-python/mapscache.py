# Nathan Holmes-King
# 2024-06-26

from bs4 import BeautifulSoup
import json
from requests import get


badpages = ['Visa requirements for British Overseas citizens',
            'Visa requirements for Chinese citizens (disambiguation)']


def getVisas():
    """
    Numerical codes:
    5. Freedom of movement
    4. Visa-free
    3. eVisa
    2. Visa on arrival
    1. Visa required in advance
    0. Admission refused
    """
    rjs = {}
    mainpage = BeautifulSoup(get('https://en.wikipedia.org/wiki/Special:'
                                 'PrefixIndex?prefix=Visa+requirements+for&'
                                 'namespace=0&hideredirects=1&stripprefix=1').
                             content, 'html.parser')
    pagelist = mainpage.find('ul', {'class':
                                    'mw-prefixindex-list'}).find_all('li')
    for li in pagelist:
        a = li.find('a')
        if 'citizens' not in a['title']:
            continue
        if a['title'] in badpages:
            continue
        cit = a.getText().strip()
        rjs[cit] = {}
        webpage = BeautifulSoup(get('https://en.wikipedia.org' + a['href']).
                                content, 'html.parser')
        tables = webpage.find_all('table')
        for t in tables:
            try:
                if t.find_all('th')[0].getText().strip()[:7] != 'Country' and \
                   t.find_all('th')[0].getText().strip()[:10] != 'Visitor to':
                    continue
            except IndexError:
                continue
            except AttributeError:
                continue
            rows = t.find('tbody').find_all('tr')
            for r in rows:
                d = r.find_all('td')
                if len(d) == 0:
                    continue
                dest = d[0].getText().strip()
                try:
                    hc = d[1]['style'].split('#')[1].split(';')[0].strip().\
                         lower()
                except KeyError:
                    continue
                except IndexError:
                    continue
                if hc == 'dff':
                    rjs[cit][dest] = 5
                elif hc == '9eff9e':
                    rjs[cit][dest] = 4
                elif hc == 'bfd' or hc == 'dfd':
                    rjs[cit][dest] = 3
                elif hc == 'ffd':
                    rjs[cit][dest] = 2
                elif hc == 'ffc7c7':
                    rjs[cit][dest] = 1
                elif hc == '000':
                    rjs[cit][dest] = 0
    json.dump(rjs, open('mapscache/visas.json', 'w'), indent=4)


if __name__ == '__main__':
    getVisas()
