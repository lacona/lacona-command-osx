/** @jsx createElement */
import _ from 'lodash'
import { PreferencePane } from 'lacona-phrases'
import { createElement } from 'elliptical'
import { watchPreferencePanes, openFile } from 'lacona-api'
import { map } from 'rxjs/operator/map'

class PaneObject {
  constructor ({path, name}) {
    this.path = path
    this.name = name
    this.type = 'preference pane'
    this.limitId = 'preference-pane'
  }

  open () {
    openFile({path: this.path})
  }
}

export const PaneSource = {
  fetch () {
    return watchPreferencePanes()::map((data) => {
      return _.map(data, (item) => new PaneObject(item))
    })
  }
}

export const Pane = {
  extends: [PreferencePane],

  describe ({observe}) {
    const data = observe(<PaneSource />)
    const panes = _.chain(data)
      .filter()
      .filter('name')
      .filter('path')
      .map(pane => ({
        text: pane.name,
        value: pane,
        annotation: {type: 'icon', value: pane.path}
      }))
      .value()

    return (
      <placeholder argument='preference pane'>
        <list strategy='fuzzy' items={panes} limit={10} score={1} />
      </placeholder>
    )
  }
}
