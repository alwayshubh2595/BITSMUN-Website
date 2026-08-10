import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone No.',
      type: 'string',
    }),
    defineField({
        name: 'email',
        title: 'Email Id:',
        type: 'string',
      }),
      defineField({
        name: 'email2',
        title: 'Alternative Email Id:',
        type: 'string',
      }),
      defineField({
        name: 'devname',
        title: 'Developer Name',
        type: 'string',
      }),
      defineField({
        name: 'devphone',
        title: 'Developer Phone',
        type: 'string',
      }),
      defineField({
        name: 'devmail',
        title: 'Developer Email Id:',
        type: 'string',
      }),

  ],
  preview: {
    select: {
      title: 'email',
    },
  },
})
