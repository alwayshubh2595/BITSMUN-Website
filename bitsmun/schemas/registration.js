import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'registration',
  title: 'Registration(Open/Closed)',
  type: 'document',
  fields: [
    defineField({
      name: 'registrationType',
      title: 'Delegate Registration Type (only type "open" or "closed")',
      type: 'string',
    }),
    defineField({
      name: 'EBregistrationType',
      title: 'EB Registration Type (only type "open" or "closed")',
      type: 'string',
    }),
    defineField({
      name: 'IntregistrationType',
      title: 'International Registration Type (only type "open" or "closed")',
      type: 'string',
    }),
    
  ],
  preview: {
    select: {
      title: 'registrationType',
    },
  },
})
