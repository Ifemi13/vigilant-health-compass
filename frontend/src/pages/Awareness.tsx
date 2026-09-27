import { useState } from 'react'
import { Link } from 'react-router'
import { useMe, type Pet } from '../lib/profile'

type Species = 'dog' | 'cat' | 'other'
type Topic = 'conditions' | 'nutrition' | 'care'
type GuideItem = { title: string; description: string; action: string }
type BreedNote = GuideItem & { species: Exclude<Species, 'other'>; topic: Topic; breeds: string[]; growingOnly?: boolean }

const topics: { id: Topic; label: string }[] = [
  { id: 'conditions', label: 'Common concerns' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'care', label: 'Everyday care' },
]

const breedNotes: BreedNote[] = [
  {
    species: 'dog',
    topic: 'conditions',
    breeds: ['pug', 'french bulldog', 'english bulldog', 'bulldog', 'boston terrier', 'pekingese', 'shih tzu'],
    title: 'Short-muzzle awareness',
    description: 'Short-muzzled breeds can be more prone to breathing and heat-tolerance difficulties.',
    action: 'Ask your vet what breathing and exercise are normal for your dog, especially in warm weather. Noisy or labored breathing at rest deserves veterinary attention.',
  },
  {
    species: 'dog',
    topic: 'conditions',
    breeds: ['dachshund', 'corgi', 'basset hound'],
    title: 'Back and mobility awareness',
    description: 'Some long-backed, short-legged breeds have a higher risk of spinal disc problems.',
    action: 'Ask your vet about maintaining a healthy body condition and handling safely. Back pain, weakness, or difficulty walking needs prompt veterinary advice.',
  },
  {
    species: 'dog',
    topic: 'nutrition',
    breeds: ['great dane', 'mastiff', 'newfoundland', 'saint bernard', 'bernese mountain dog', 'rottweiler'],
    growingOnly: true,
    title: 'Large-breed puppy growth',
    description: 'Puppies of large and giant breeds have specific growth and nutrient needs.',
    action: 'Ask your vet whether a large-breed growth formula and a particular feeding plan are right for your puppy. Avoid adding supplements without veterinary advice.',
  },
  {
    species: 'cat',
    topic: 'conditions',
    breeds: ['persian', 'exotic shorthair'],
    title: 'Flat-faced cat awareness',
    description: 'Some flat-faced cats can be more prone to breathing or eye-discharge issues.',
    action: 'Ask your vet what is normal for your cat. New or persistent noisy breathing, eye irritation, or discharge should be checked.',
  },
  {
    species: 'cat',
    topic: 'care',
    breeds: ['persian', 'maine coon', 'ragdoll', 'norwegian forest cat', 'siberian'],
    title: 'Long-coat grooming',
    description: 'Long or dense coats may need regular combing to reduce tangles and mats.',
    action: 'Use short, gentle grooming sessions and check areas that tangle easily. Ask a veterinary professional or groomer for help with mats rather than pulling them.',
  },
]

const guides: Record<Exclude<Species, 'other'>, Record<Exclude<Topic, 'nutrition'>, GuideItem[]>> = {
  dog: {
    conditions: [
      { title: 'Dental disease', description: 'Tartar, gum inflammation, and painful teeth can be easy to miss.', action: 'Watch for persistent bad breath, red gums, dropping food, or reluctance to chew. Ask your vet to check the mouth and recommend home dental care.' },
      { title: 'Itchy skin and ears', description: 'Allergies, parasites, and infections can all cause scratching or head shaking.', action: 'Note when itching started and where it occurs. Contact your clinic for ongoing symptoms; do not put cleaners or medication in the ears unless advised.' },
      { title: 'Weight and joint health', description: 'Extra weight can add strain to joints and make activity less comfortable.', action: 'Track weight over time and mention stiffness, limping, or reduced activity to your vet. A healthy target depends on body condition, build, and age.' },
    ],
    care: [
      { title: 'Movement and enrichment', description: 'Regular walks, play, and sniffing opportunities support fitness and behavior.', action: 'Build activity gradually and adapt it to age, fitness, weather, and any mobility advice from your vet.' },
      { title: 'Teeth, coat, and nails', description: 'Small, regular care routines make changes easier to spot.', action: 'Introduce brushing with pet-safe dental products, care for the coat as needed, and trim nails before they interfere with walking.' },
      { title: 'Preventive visits', description: 'Vaccines, parasite prevention, and dental checks depend on health and local risk.', action: 'Ask your veterinary team for a schedule suited to your dog rather than relying on a one-size-fits-all calendar.' },
    ],
  },
  cat: {
    conditions: [
      { title: 'Dental disease', description: 'Gum and tooth problems may reduce comfort even when a cat keeps eating.', action: 'Watch for bad breath, drooling, pawing at the mouth, or changes in food preference. Ask your vet to assess oral health.' },
      { title: 'Urinary changes', description: 'Changes in litter-box visits, urine, or comfort need attention.', action: 'Repeated trips, crying, blood, or urinating outside the box warrant prompt veterinary advice. Straining with little or no urine is an emergency, especially in male cats.' },
      { title: 'Weight and activity', description: 'Indoor routines and changes in activity can make gradual weight gain hard to notice.', action: 'Use regular weigh-ins and play, and ask your vet to assess body condition before changing food portions.' },
    ],
    care: [
      { title: 'Litter-box habits', description: 'A clean, accessible litter area helps you notice changes in normal use.', action: 'Keep boxes clean and easy to reach. A sudden change in frequency, location, or appearance is worth discussing with your vet.' },
      { title: 'Play and safe spaces', description: 'Short play sessions, scratching surfaces, and quiet resting spots support daily wellbeing.', action: 'Offer predictable play and places to climb, hide, and rest. Keep indoor plants and household hazards in mind.' },
      { title: 'Preventive visits', description: 'Vaccines, parasite prevention, and dental checks should reflect lifestyle and local risk.', action: 'Ask your veterinary team how often your cat needs checkups and which prevention is appropriate.' },
    ],
  },
}

const otherGuides: Record<Topic, GuideItem[]> = {
  conditions: [{ title: 'Notice changes from normal', description: 'Eating, drinking, breathing, movement, droppings, and behavior can all offer useful clues.', action: 'Note what changed and when. Contact a veterinarian familiar with your pet’s species for concerning or persistent changes.' }],
  nutrition: [{ title: 'Use species-appropriate food', description: 'Nutritional needs vary widely between species and can change with age and health.', action: 'Choose a complete diet for your pet’s species and life stage with veterinary guidance. Do not assume dog or cat food is suitable for other animals.' }],
  care: [{ title: 'Match care to the species', description: 'Housing, social needs, temperature, handling, and enrichment differ substantially between animals.', action: 'Ask a veterinarian or consult a reputable species-specific welfare resource to plan daily care and preventive checkups.' }],
}

export default function Awareness() {
  const { data: me } = useMe()
  const pets = me?.pets ?? []
  const [selectedPetId, setSelectedPetId] = useState('')
  const [generalSpecies, setGeneralSpecies] = useState<Species>('dog')
  const [topic, setTopic] = useState<Topic>('conditions')
  const pet = pets.find((item) => item.id === selectedPetId) ?? pets[0]
  const species = pet ? identifySpecies(pet.species) : generalSpecies
  const stage = pet ? getLifeStage(pet, species) : null
  const items = getGuideItems(topic, species, stage)
  const breedNote = pet && species !== 'other' ? getBreedNote(species, pet.breed, topic, stage) : null

  return (
    <>
      <Link to="/pets" className="text-sm font-medium text-accent hover:underline dark:text-accent-light">← Back to Pets</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent dark:text-accent-light">Pet wellness guide</p>
          <h1 className="mt-2 text-3xl font-semibold">Awareness</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">Clear, practical notes on common health concerns, food, and everyday care.</p>
        </div>
        {pets.length > 1 ? (
          <label className="grid gap-1 text-sm font-medium">
            Choose a pet
            <select value={pet?.id ?? ''} onChange={(event) => setSelectedPetId(event.target.value)} className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-[#1c1830] dark:text-white">
              {pets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        ) : !pet ? (
          <label className="grid gap-1 text-sm font-medium">
            Browse guidance for
            <select value={generalSpecies} onChange={(event) => setGeneralSpecies(event.target.value as Species)} className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-[#1c1830] dark:text-white">
              <option value="dog">Dogs</option><option value="cat">Cats</option><option value="other">Other species</option>
            </select>
          </label>
        ) : null}
      </div>

      {pet && <PetContext pet={pet} species={species} stage={stage} />}

      <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800" aria-label="Awareness topics">
        {topics.map((item) => (
          <button key={item.id} type="button" aria-pressed={topic === item.id} onClick={() => setTopic(item.id)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${topic === item.id ? 'bg-accent text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-6" aria-live="polite">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{topics.find((item) => item.id === topic)?.label}</h2>
          {topic === 'conditions' && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Common topics to discuss with a veterinary professional, not a diagnosis.</p>}
        </div>
        <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <GuideCard key={item.title} item={item} />)}</div>
        {breedNote && (
          <aside className="mt-4 rounded-lg border border-accent/30 bg-accent-soft/40 p-4 dark:border-accent/40 dark:bg-accent/10">
            <h3 className="font-semibold">Breed-aware note: {breedNote.title}</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{breedNote.description}</p>
            <p className="mt-2 text-sm">{breedNote.action}</p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Breed can affect risk, but does not predict an individual pet’s health. Use this as a topic to discuss with your vet.</p>
          </aside>
        )}
        {topic === 'nutrition' && pet && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-[#1c1830]">
            <h3 className="font-semibold">Your pet’s recorded details</h3>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{pet.weightKg != null ? `Recorded weight: ${pet.weightKg} kg. Weight alone does not show whether it is healthy; ask your vet about body condition and portions.` : 'No weight is recorded. Ask your vet about body condition and an appropriate daily portion.'}</p>
          </div>
        )}
      </section>

      {pet?.allergies && (
        <aside className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 className="font-semibold">Allergy information on file</h2><p className="mt-1">{pet.allergies}</p>
          <p className="mt-1">Check ingredients with your veterinary team before changing food.</p>
        </aside>
      )}
      <aside className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
        <h2 className="font-semibold">When to get help</h2>
        <p className="mt-1">Trouble breathing, collapse, seizures, suspected poisoning, or inability to pass urine needs urgent veterinary attention. For any worrying or worsening change, contact your clinic.</p>
      </aside>
      {!pet && <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">Guidance is general because no pet profile is available. <Link to="/profile" className="font-medium text-accent underline dark:text-accent-light">View your profile</Link>.</p>}
    </>
  )
}

function PetContext({ pet, species, stage }: { pet: Pet; species: Species; stage: string | null }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-[#1c1830]">
      <span className="font-semibold">Guidance for {pet.name}</span>
      <span className="text-slate-500 dark:text-slate-400">{[pet.species, pet.breed, stage].filter(Boolean).join(' · ')}</span>
      {species === 'other' && <span className="text-slate-500 dark:text-slate-400">Species-specific dog and cat guidance is not shown.</span>}
    </div>
  )
}

function GuideCard({ item }: { item: GuideItem }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#1c1830]">
      <h3 className="font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
      <p className="mt-3 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">{item.action}</p>
    </article>
  )
}

function identifySpecies(value: string): Species {
  const normalized = value.toLowerCase()
  if (normalized.includes('dog') || normalized.includes('canine')) return 'dog'
  if (normalized.includes('cat') || normalized.includes('feline')) return 'cat'
  return 'other'
}

function getGuideItems(topic: Topic, species: Species, stage: string | null): GuideItem[] {
  if (topic === 'nutrition') return species === 'other' ? otherGuides.nutrition : nutritionGuide(species, stage)
  if (species === 'other') return otherGuides[topic]
  return guides[species][topic]
}

function getBreedNote(
  species: Exclude<Species, 'other'>,
  breed: string | null,
  topic: Topic,
  stage: string | null,
): BreedNote | null {
  if (!breed) return null
  const normalizedBreed = normalizeBreed(breed)
  const note = breedNotes.find((candidate) =>
    candidate.species === species
    && candidate.topic === topic
    && (!candidate.growingOnly || stage === 'growing')
    && candidate.breeds.some((name) => {
      const normalizedName = normalizeBreed(name)
      return normalizedBreed === normalizedName
        || normalizedBreed.startsWith(`${normalizedName} `)
        || normalizedBreed.includes(` ${normalizedName} `)
    }),
  )
  return note ?? null
}

function normalizeBreed(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}

function getLifeStage(pet: Pet, species: Species): string {
  if (!pet.birthDate) return 'age not recorded'
  const [year, month, day] = pet.birthDate.split('-').map(Number)
  if (!year || !month || !day) return 'age not recorded'
  const now = new Date()
  let ageMonths = (now.getFullYear() - year) * 12 + now.getMonth() + 1 - month
  if (now.getDate() < day) ageMonths -= 1
  if (ageMonths < 12) return 'growing'
  if (species === 'cat' ? ageMonths >= 120 : ageMonths >= 84) return 'mature'
  return 'adult'
}

function nutritionGuide(species: Exclude<Species, 'other'>, stage: string | null): GuideItem[] {
  const growing = species === 'dog' ? 'puppy growth' : 'kitten growth'
  const first: GuideItem = stage === 'growing'
    ? { title: 'Food for a growing pet', description: `Choose food labeled complete and balanced for ${growing}.`, action: 'Growth needs and the right time to change diets vary by breed, size, and health. Ask your vet to review growth and portions; do not restrict a growing pet without veterinary advice.' }
    : stage === 'mature'
      ? { title: 'Nutrition for a mature pet', description: 'Age alone does not determine which diet is right; activity, body condition, teeth, and health also matter.', action: 'Choose a complete diet appropriate to your pet and ask your vet whether health changes call for a different food or portion.' }
      : { title: `Choose a complete ${species} food`, description: stage === 'adult' ? 'Look for food labeled complete and balanced for the appropriate life stage.' : 'Choose a complete and balanced food for your pet’s species and life stage; age is not recorded in the profile.', action: 'Use feeding directions as a starting point, measure portions, and adjust with your vet based on body condition and weight trends.' }
  const second: GuideItem = species === 'cat'
    ? { title: 'Water and feline needs', description: 'Cats have specific nutrient requirements, and dog food is not a suitable substitute for a complete cat diet.', action: 'Keep fresh water available. Wet, dry, or combined feeding can be discussed with your vet, especially if your cat has a health condition.' }
    : { title: 'Water, treats, and safe choices', description: 'Fresh water should always be available. Treats and extras can add up quickly.', action: 'Keep treats modest, avoid table scraps or supplements unless your vet approves them, and check before changing foods if your dog has a health condition.' }
  return [first, second]
}