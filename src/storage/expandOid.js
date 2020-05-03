import { NotFoundError } from 'errors/NotFoundError'
import { _readObject as readObject } from 'storage/readObject'

import { AmbiguousError } from '../errors/AmbiguousError.js'
import { expandOidLoose } from '../storage/expandOidLoose.js'
import { expandOidPacked } from '../storage/expandOidPacked.js'

export async function _expandOid({ fs, gitdir, oid: short }) {
  // Curry the current read method so that the packfile un-deltification
  // process can acquire external ref-deltas.
  const getExternalRefDelta = oid => readObject({ fs, gitdir, oid })

  const results1 = await expandOidLoose({ fs, gitdir, oid: short })
  const results2 = await expandOidPacked({
    fs,
    gitdir,
    oid: short,
    getExternalRefDelta,
  })
  const results = results1.concat(results2)

  if (results.length === 1) {
    return results[0]
  }
  if (results.length > 1) {
    throw new AmbiguousError('oids', short, results)
  }
  throw new NotFoundError(`an object matching "${short}"`)
}
