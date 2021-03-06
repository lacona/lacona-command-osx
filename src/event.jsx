/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { Date as DatePhrase } from 'lacona-phrases'
import { isDemo } from 'lacona-api'
import { Observable } from 'rxjs/Observable'

const Holidays = {
  fetch () {
    return new Observable((observer) => {
      observer.next([])

      if (isDemo()) {
        observer.next(global.demoData.usHolidays)
      }
    })
  }
}

export const Holiday = {
  extends: [DatePhrase],

  describe ({observe}) {
    const data = observe(<Holidays />)
    if (data.length === 0) return

    return (
      <placeholder argument='holiday'>
        <list strategy='fuzzy' items={data} limit={10} />
      </placeholder>
    )
  }
}
