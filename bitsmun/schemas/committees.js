import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'committees',
  title: 'Committees',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Type(Online/Offline)',
      type: 'string',
    }),
    defineField({
      name: 'agenda',
      title: 'Agenda',
      type: 'string',
    }),
    defineField({
      name: 'delegateStrength',
      title: 'Delegate Strength',
      type: 'string',
      description: 'e.g. 50, 15-20, or TBD',
    }),
    defineField({
      name: 'freezeDate',
      title: 'Freeze Date',
      type: 'string',
      description: 'For crisis committees, e.g. June 2013',
    }),
    defineField({
      name: 'chair',
      title: 'Chairperson',
      type: 'string',
    }),
    defineField({
      name: 'viceChair',
      title: 'Vice Chairperson',
      type: 'string',
    }),
    defineField({
        name: 'rapporteur',
        title: 'Rapporteur',
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
