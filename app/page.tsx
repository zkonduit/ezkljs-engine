export default function Home() {
  return (
    <main className='h-56 flex flex-col justify-between pt-8'>
      <p>
        ZKML proving and verifying in browser and nodejs contexts can be quite
        the pain to setup and maintain. There are alot of things that can go
        wrong, from serialization, memory constraints, web assembly
        configuration and more.
      </p>
      <p>
        Luckily the EZKL Engine and EZKL Verify npm packages abstract away all
        of this complexity, making it easy to integrate ZKML into any javascript
        project.
      </p>
      <p>
        Our simple, yet powerful APIs allow you to encrypt, hash, prove and
        verify ML inferences in a variety of ways.
      </p>
      <p>
        Check out the tabs to the right where you can demo the EZKL Engine and
        EZKL Verify packages in action.
      </p>
    </main>
  )
}
