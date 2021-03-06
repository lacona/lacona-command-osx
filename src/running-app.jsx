/** @jsx createElement */
import _ from 'lodash'
import {createElement, unique} from 'elliptical'
import {RunningApplication} from 'lacona-phrases'
import {isDemo, fetchRunningApplications, activateApplication, hideApplication, closeApplicationWindows, quitApplication, openFile} from 'lacona-api'
import {Observable} from 'rxjs/Observable'
import {map} from 'rxjs/operator/map'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {startWith} from 'rxjs/operator/startWith'
import {concat} from 'rxjs/operator/concat'
import {fromPromise} from 'rxjs/observable/fromPromise'

export const RunningAppSource = {
  fetch ({activate}) {
    if (isDemo()) {
      return new Observable((observer) => {
        fetchRunningApplications((err, apps) => {
          const trueData = _.map(apps, app => {
            if (app.activationPolicy === 'regular') {
              return new DockAppObject(app)
            } else {
              return new MenuBarAppObject(app)
            }
          })
          observer.next(trueData)
        })
      })
    } else {
      return fromPromise(fetchRunningApplications())::concat(
        activate::mergeMap(() => {
          return fromPromise(fetchRunningApplications())
        })
      )::map((apps) => {
        return _.map(apps, app => {
          if (app.activationPolicy === 'regular') {
            return new DockAppObject(app)
          } else {
            return new MenuBarAppObject(app)
          }
        })
      })::startWith([])
    }
  }
}

class MenuBarAppObject {
  constructor({bundleId, name, path}) {
    this.path = path
    this.name = name
    this.type = 'application'
    this.bundleId = bundleId
    this[unique] = path
  }

  quit () {
    return quitApplication({path: this.path})
  }

  launch () {
    return openFile({path: this.path})
  }
}

class DockAppObject {
  constructor({bundleId, name, path}) {
    this.name = name
    this.type = 'application'
    this.path = path
    this.bundleId = bundleId
    this[unique] = path
  }

  activate () {
    return activateApplication({path: this.path})
  }

  launch () {
    return openFile({path: this.path})
  }

  hide () {
    return hideApplication({path: this.path})
  }

  close () {
    return closeApplicationWindows({bundleId: this.bundleId})
  }

  quit () {
    return quitApplication({path: this.path})
  }
}

export const RunningApp = {
  extends: [RunningApplication],

  describe ({observe, props}) {
    const data = observe(<RunningAppSource />)
    const apps = _.chain(data)
      .filter()
      .filter('name')
      .map(app => ({text: app.name, value: app}))
      .value()

    return (
      <placeholder argument='application' suppressEmpty={props.suppressEmpty}>
        <list strategy='fuzzy' items={apps} unique />
      </placeholder>
    )
  }
}
