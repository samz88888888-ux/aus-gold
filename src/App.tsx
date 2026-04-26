import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavigationShowcase } from './features/figma/NavigationShowcase'
import { MingPage } from './features/old-pages/pages/ming/MingPage'
import { MingLogPage } from './features/old-pages/pages/ming/MingLogPage'
import { DestoryListPage } from './features/old-pages/pages/ming/DestoryListPage'
import { ShopPage } from './features/old-pages/pages/shop/ShopPage'
import { ShopOrderListPage } from './features/old-pages/pages/shop/ShopOrderListPage'
import { ShopOrderReleasePage } from './features/old-pages/pages/shop/ShopOrderReleasePage'
import { ShopDetailPage } from './features/old-pages/pages/shop/ShopDetailPage'
import { ShopOrderConfirmPage } from './features/old-pages/pages/shop/ShopOrderConfirmPage'
import { OrdersPage } from './features/old-pages/pages/order/OrdersPage'
import { UserPage } from './features/old-pages/pages/user/UserPage'
import { AddressListPage } from './features/old-pages/pages/address/AddressListPage'
import { AddressAddPage } from './features/old-pages/pages/address/AddressAddPage'
import { AddressEditPage } from './features/old-pages/pages/address/AddressEditPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavigationShowcase />} />
        <Route path="/ming" element={<MingPage />} />
        <Route path="/mingLog" element={<MingLogPage />} />
        <Route path="/destoryList" element={<DestoryListPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/orderList" element={<ShopOrderListPage />} />
        <Route path="/shop/orderRelease" element={<ShopOrderReleasePage />} />
        <Route path="/shop/detail/:id" element={<ShopDetailPage />} />
        <Route path="/shop/orderConfirm" element={<ShopOrderConfirmPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/address" element={<AddressListPage />} />
        <Route path="/address/add" element={<AddressAddPage />} />
        <Route path="/address/edit/:id" element={<AddressEditPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
