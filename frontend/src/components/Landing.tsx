import '../App.scss'
import { useNavigate } from 'react-router';

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="grid-layout">
      <div className="center col-span-3">
        <img src="/pelican-logo-1-no-bg.png" alt="logo" className='logo'/>
      </div>

      <div className="center col-span-3">
        <button className='button' onClick={() => navigate('/active-orders')}>Active Orders</button>
      </div>
      <div className="center col-span-3">
        <button className='button' onClick={() => navigate('/new-order')}>New Order</button>
      </div>
      <div className="center col-span-3">
        <button className='button' onClick={() => navigate('/past-orders')}>Past Orders</button>
      </div>

      <div className="center">
        <button className='button-wider'>Open Drawer</button>
      </div>
      <div></div>
      <div className='center'>
        <button className='button-wider' onClick={()=>navigate('/config')}>Update Items</button>
      </div>
    </div>
  );
}

export default Landing;