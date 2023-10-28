export default function Home() {
  return (
    <main className='h-56 flex flex-col justify-between pt-8'>
      <p>
        ZKML proving and verifying in browser and nodejs contexts can be quit
        the pain to setup and maintain. There are alot of things that can go wrong,
        from serialization, memory constrains, web assembly configuration and more.
      </p>
      <p>
        Luckily the EZKL Engine and EZKL Verify npm packages abstracts away all of this complexity,
        making it easy to integrate ZKML in any javascript project.
      </p>
      <p>
        Our simple, yet powerful APIs allow you to encyrpt, hash, prove and
        verify ML inferences in a variety of ways.
      </p>
    </main>
  )
}
