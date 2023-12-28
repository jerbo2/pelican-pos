import '../App.css'
import { useNavigate } from 'react-router';

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 grid-rows-5 h-screen w-screen bg-blend-soft-light">
      <div className="center col-span-3">
        <img src="public/pelican-logo-1-no-bg.png" alt="logo" className="h-80 w-80 transition-opacity"/>
      </div>

      <div className="center col-span-3">
        <button className='button h-1/3 w-1/3 text-4xl' onClick={()=>navigate('/active-orders')}>Active Orders</button>
      </div>
      <div className="center col-span-3">
        <button className='button h-1/3 w-1/3 text-4xl' onClick={()=>navigate('/new-order')}>New Order</button>
      </div>
      <div className="center col-span-3">
        <button className='button h-1/3 w-1/3 text-4xl' onClick={()=>navigate('/past-orders')}>Past Orders</button>
      </div>

      <div className="center">
        <button className='button w-2/3 h-1/3 text-4xl'>Open Drawer</button>
      </div>
    </div>
  );
}

export default Landing;