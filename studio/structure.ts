import type {StructureResolver} from 'sanity/structure'
import {capabilityIds} from './schemaTypes/capabilityArea'

export const structure: StructureResolver = S => S.list().title('Portfolio content').items([
  S.listItem().id('profile').title('Profile').child(S.document().schemaType('profile').documentId('profile')),
  S.listItem().id('siteContent').title('Site Content').child(S.document().schemaType('siteContent').documentId('siteContent')),
  S.divider(),
  S.documentTypeListItem('project').title('Projects').child(
    S.documentTypeList('project').title('Projects').defaultOrdering([{field: 'displayOrder', direction: 'asc'}, {field: 'stableId', direction: 'asc'}]),
  ),
  S.documentTypeListItem('experience').title('Experiences').child(
    S.documentTypeList('experience').title('Experiences').defaultOrdering([{field: 'startYear', direction: 'asc'}, {field: 'endYear', direction: 'asc'}, {field: 'stableId', direction: 'asc'}]),
  ),
  S.documentTypeListItem('technology').title('Technologies').child(
    S.documentTypeList('technology').title('Technologies').defaultOrdering([{field: 'stableId', direction: 'asc'}]),
  ),
  S.divider(),
  S.listItem().id('capabilityAreas').title('Capability Areas').child(
    S.list().title('Capability Areas').items(capabilityIds.map(id =>
      S.listItem().id(id).title(id[0]!.toUpperCase() + id.slice(1)).child(
        S.document().schemaType('capabilityArea').documentId(`capability.${id}`).initialValueTemplate(`capability-${id}`),
      ),
    )),
  ),
])
