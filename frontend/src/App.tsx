import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [data, setData] = useState({'message': ''})

  useEffect(() => {
    axios.get('/api').then((res) => {
      setData(res.data)
      console.log(res.data)
    }).catch((err) => {
      console.error(err)
    })
  }, [])

  return (
    <>
      <div>
        {data['message']}
      </div>
    </>
  )
}

export default App
