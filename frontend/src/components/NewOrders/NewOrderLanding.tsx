import { useContext, useEffect } from "react";
import BaseItems from "../BaseComps/BaseItems";
import { Hidden, Box, IconButton } from "@mui/material";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { OrderContext } from "./contexts/OrderContext";
import axios from "axios";
import NewOrderModal from "./NewOrderModal";
import { UIContext } from "../BaseComps/contexts/UIContext";


export default function NewOrderLanding() {
  const { activeOrder, setOrderItems, orderItems } = useContext(OrderContext);
  const { setOpenPopup } = useContext(UIContext);

  useEffect(() => {
    const get_order_items = async () => {
      const url = `/api/v1/orders-items/${activeOrder.id}/`
      const order_items = await axios.get(url)
      setOrderItems(order_items.data)
    }
    get_order_items();
  }, [activeOrder]);

  const handleRightIconClick = () => {
    setOpenPopup(true);
    console.log(orderItems)
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflowX: 'hidden' }}>
      <BaseItems pageRoot="new-order" pageName="NEW ORDER" rightIcon=
        {activeOrder.id !== -1 && (
          <Hidden smDown>
            <IconButton
              color="inherit"
              aria-label="back"
              size="large"
              onClick={handleRightIconClick}
            >
              <ShoppingCartOutlinedIcon fontSize='large' />
            </IconButton>
          </Hidden>
        )} />
      <NewOrderModal />
    </Box>
  );
}