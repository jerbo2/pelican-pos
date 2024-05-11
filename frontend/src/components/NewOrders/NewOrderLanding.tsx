import { useContext, useEffect } from "react";
import BaseItems from "../BaseComps/BaseItems";
import { Hidden, Box } from "@mui/material";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Button } from "../Styled";
import { OrderContext } from "./contexts/OrderContext";
import axios from "axios";
import NewOrderModal from "./NewOrderModal";
import { UIContext } from "../BaseComps/contexts/UIContext";


export default function NewOrderLanding() {
  const { activeOrder, setOrderItems, orderItems } = useContext(OrderContext);
  const { openPopup, setOpenPopup } = useContext(UIContext);

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
            <Button
              color="inherit"
              aria-label="back"
              onClick={handleRightIconClick}
            >
              <ShoppingCartOutlinedIcon fontSize='large' />
            </Button>
          </Hidden>
        )} />
      <NewOrderModal />
    </Box>
  );
}