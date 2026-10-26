import type { Section } from '../types'

export const schemaDrift: Section = {
  id: 'schema-drift',
  title: 'Schema drift: the tracker changed',
  scene: 'ingest-drift',
  narration:
    "Data changes shape when nobody is watching. On the first of June, the web team shipped a new tracker. It renamed context dot device to device type, and it added a field called consent. Nothing failed. The experiment reads the last day of May and the first of June together, letting Spark guess one schema for both, and counts each field per file. The May file has device for every event and no device type. The June file has the opposite, plus consent. Notice that the change follows the file, not the event time: a late event from May that arrived in June's folder is written the new way. Now imagine our declared schema had kept only the new name. Spark would read May without complaint, and every May device would be null, silently. A declared schema simply ignores a field it does not name. So the CLICKS schema now declares both names, and bronze dot clicks merges them. Coalesce takes the first value that is not null, device type, else device, writes it back into the context struct as device, and drops the other field. After that, the device is known for every one of the one thousand eight hundred and three events across both days. The habit to keep is this: when a source changes shape, the schema records both shapes, with a comment saying when the change happened, and the code that merges them lives in one place.",
}
