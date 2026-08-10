import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'developer',
  title: 'Developer Details',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Developer Name',
      type: 'string',
    }),
    defineField({
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true,
        },
      }),
      defineField({
        name: 'github',
        title: 'Github(Enter Link, Optional)',
        type: 'string',
      }),
      defineField({
        name: 'linkedin',
        title: 'LinkedIn(Enter Link, Optional)',
        type: 'string',
      }),
      defineField({
        name: 'instagram',
        title: 'Developer Instagram(Enter Link,Optional)',
        type: 'string',
      }),

  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',

    },
  },
})
