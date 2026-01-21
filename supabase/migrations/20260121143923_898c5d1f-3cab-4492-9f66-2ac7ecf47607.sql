-- Allow staff roles to work with order flow (packing + delivery)

-- ORDERS: Fulfillment can see packing queue
CREATE POLICY "Fulfillment can view packing orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'order_fulfillment'
  )
  AND status IN ('pending','processing','dispatched')
);

-- ORDERS: Fulfillment can update packing-related statuses
CREATE POLICY "Fulfillment can update packing orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'order_fulfillment'
  )
  AND status IN ('pending','processing')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'order_fulfillment'
  )
  AND status IN ('processing','dispatched')
);

-- ORDERS: Delivery staff can see available dispatches + their assigned orders
CREATE POLICY "Delivery can view dispatches and assignments"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'delivery'
  )
  AND (
    status = 'dispatched'
    OR assigned_to = auth.uid()
  )
);

-- ORDERS: Delivery staff can update only eligible orders
CREATE POLICY "Delivery can update delivery orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'delivery'
  )
  AND (
    -- start delivery from dispatch (unassigned or already assigned to me)
    (status = 'dispatched' AND (assigned_to IS NULL OR assigned_to = auth.uid()))
    OR
    -- complete delivery when it's already mine
    (status = 'out_for_delivery' AND assigned_to = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'delivery'
  )
  AND assigned_to = auth.uid()
  AND status IN ('out_for_delivery','delivered')
);

-- ORDER TRACKING EVENTS: staff can insert + read (needed for insert returning representation)
CREATE POLICY "Staff can insert tracking events"
ON public.order_tracking_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','order_fulfillment','delivery')
  )
);

CREATE POLICY "Staff can view tracking events"
ON public.order_tracking_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','order_fulfillment','delivery')
  )
);
