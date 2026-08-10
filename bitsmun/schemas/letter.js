import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'letter',
  title: 'Letter',
  type: 'document',
  fields: [
    defineField({
      name: 'letter',
      title: 'Letter',
      type: 'text',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'authorPost',
      title: 'Author Post',
      type: 'string',
    }),
    defineField({
      name: 'bitsmunEdition',
      title: 'BITSMUN Edition(Year)',
      type: 'string',
    }),
    
  ],
  preview: {
    select: {
      title: 'letter',
    },
  },
})
