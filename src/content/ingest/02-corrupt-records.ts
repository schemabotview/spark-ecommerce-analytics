import type { Section } from '../types'

export const corruptRecords: Section = {
  id: 'corrupt-records',
  title: 'Corrupt records: encodings and bad lines',
  scene: 'ingest-corrupt-records',
  narration:
    "The warehouse sends a monthly file of returns, and it is the messiest source Shopwave has. Read it the default way, as U T F eight, and a German reason, Größe falsch, wrong size, comes out with question marks where the o umlaut and the sharp s should be. The warehouse's system writes Latin one, where each of those letters is a single byte that U T F eight cannot decode. Telling Spark the encoding fixes it, and the bronze returns function does exactly that. The second problem is lines that do not fit the schema. Spark's CSV reader has three modes. Fail fast stops at the first bad line. Drop malformed throws bad lines away without a word, which is how data quietly goes missing. Permissive, the default, keeps every line, and when we add a column called underscore corrupt record to the schema, Spark puts the whole raw line there whenever it cannot parse it. The function caches the result, because Spark refuses a query that looks only at the corrupt record column straight from the file, and then splits it in two: good rows, and bad rows. October has fifty eight good lines and three bad ones, and the side pane shows why each is bad. One is missing fields. One opens a quote and never closes it, so the parser swallowed the rest of the line into the reason. One writes its date day first, with slashes. None of them is lost: they are set aside, to be shown to the warehouse team, while the good rows move on.",
}
