import { useContext, useEffect } from "react";
import BaseItems from "../BaseComps/BaseNav";
import { Hidden, Box, IconButton } from "@mui/material";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { OrderContext } from "./contexts/OrderContext";
import axios from "axios";
import NewOrderModal from "./NewOrderModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import SelectPendingOrder from "./SelectPendingOrder";


export default function NewOrderLanding() {
  const { activeOrder, setOrderItems } = useContext(OrderContext);
  const { setOpenPopup } = useContext(UIContext);

  useEffect(() => {
    const get_order_items = async () => {
      const url = `/api/v1/orders-items/items/${activeOrder.id}/`
      const order_items = await axios.get(url)
      setOrderItems(order_items.data)
    }
    get_order_items();
  }, [activeOrder]);

  const handleRightIconClick = () => {
    setOpenPopup(true);
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
      <BaseItems pageRoot="order" pageName="ORDER EDITOR" rightIcon=
        {!(activeOrder.id === -1) ?
          <Hidden smDown>
            <IconButton
              color="inherit"
              aria-label="back"
              size="large"
              onClick={handleRightIconClick}
            >
              <ShoppingCartOutlinedIcon fontSize='large' />
            </IconButton>
          </Hidden> : <SelectPendingOrder />
        } />
      <NewOrderModal />
    </Box>
  );
}