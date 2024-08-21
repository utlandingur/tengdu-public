# Nathan Holmes-King
# 2024-05-29

from flask import Flask
import firebase_admin
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
import numpy as np
import sys

"""
Command-line arugments:
1. Variable
2. Filters

Filters MUST be in this format: "variable > int, variable2 == int".
Whitespace counts.
"""

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

# We need to do the db imports after initializing the app
from db.users import get_users


@app.route("/users")
def users():
    users = get_users()
    return users


def viz(var, filters=None):
    """
    Creates visualization.
    """
    userlist = users()
    if filters is not None:
        flisttemp = filters.split(', ')
        filterlist = []
        for a in flisttemp:
            b = a.split(' ')
            try:
                b[2] = int(b[2])
            except ValueError:
                pass
            filterlist.append(b)
        n = 0
        while n < len(userlist):
            f = True
            for a in filterlist:
                if (a[1] == '=' or a[1] == '==') and userlist[n][a[0]] != a[2]:
                    f = False
                    break
                elif a[1] == '<' and userlist[n][a[0]] >= a[2]:
                    f = False
                    break
                elif a[1] == '>' and userlist[n][a[0]] <= a[2]:
                    f = False
                    break
                elif a[1] == '<=' and userlist[n][a[0]] > a[2]:
                    f = False
                    break
                elif a[1] == '>=' and userlist[n][a[0]] < a[2]:
                    f = False
                    break
            if f:
                n += 1
            else:
                del userlist[n]
    fig, ax = plt.subplots(figsize=(10, 9))
    if var == 'location':
        X = []
        for a in userlist:
            try:
                X.append(userlist[a]['location'])
            except KeyError:
                X.append('?')
        ax.barh(X)
        ax.set_title('Locations of users')
        ax.set_xlabel('Count')
        ax.set_ylabel('Location')
    elif var == 'coords':
        lons = []
        lats = []
        for a in userlist:
            try:
                lons.append(userlist[a]['coords'][1])
                lats.append(userlist[a]['coords'][0])
            except KeyError:
                pass
        m = Basemap(projection='robin', lon_0=10)
        x, y = m(lons, lats)
        m.drawmapboundary(fill_color='#9ff')
        m.fillcontinents(color='#c96', lake_color='#9ff')
        m.scatter(x, y, 3)
        ax.set_title('Locations of users')
    elif var == 'interests':
        X = []
        for a in userlist:
            try:
                for b in userlist[a]['interests']:
                    X.append(b)
            except KeyError:
                pass
        ax.barh(X)
        ax.set_title('Interests of users')
        ax.set_xlabel('Count')
        ax.set_ylabel('Interest')
    elif var == 'availability':
        weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',
                    'saturday', 'sunday']
        times = ['morning', 'afternoon', 'evening']
        df = np.zeros((7, 3))
        for a in userlist:
            for i in range(7):
                for j in range(3):
                    if userlist[a]['availability'][weekdays[i]][times[j]]:
                        df[i][j] += 1
        ax.imshow(df)
        ax.set_title('Availability by day and time')
        ax.set_xticks(np.arange(len(weekdays)), labels=weekdays)
        ax.set_yticks(np.arange(len(times)), labels=times)
    plt.show()


if __name__ == '__main__':
    if len(sys.argv) == 2:
        viz(sys.argv[1])
    elif len(sys.argv) == 3:
        viz(sys.argv[1], filters=sys.argv[2])
