import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutus',
  title: 'About Us',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'srno',
      title: 'Serial No',
      type: 'number',
    }),
    defineField({
        name: 'post',
        title: 'Post',
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
        title: 'Instagram(Enter Link,Optional)',
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
