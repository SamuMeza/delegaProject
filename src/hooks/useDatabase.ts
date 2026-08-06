import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Config, Operator, Order, OrderAttachment, OrderStatus, Subscription } from "@/lib/types";

// Hook que reescribe la misma interfaz reactiva de useDelegaDB pero sobre Supabase
export function useOperators(): Operator[] | undefined {
  const [data, setData] = useState<Operator[] | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("operators")
      .select("*")
      .order("username")
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useOperators:", error);
          setData([]);
        } else {
          // Mapeamos los campos de snake_case a camelCase para respetar la interfaz de la app
          const mapped = (resData || []).map((o: any) => ({
            id: o.id,
            username: o.username,
            displayName: o.display_name,
            passwordHash: o.password_hash,
            role: o.role,
            services: o.services,
            color: o.color,
            active: o.active,
            createdAt: new Date(o.created_at).getTime(),
          }));
          setData(mapped);
        }
      });
  }, []);

  return data;
}

export function useOperator(username: string | undefined): Operator | undefined {
  const [data, setData] = useState<Operator | undefined>(undefined);

  useEffect(() => {
    if (!username) {
      setData(undefined);
      return;
    }
    supabase
      .from("operators")
      .select("*")
      .eq("username", username)
      .maybeSingle()
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useOperator:", error);
          setData(undefined);
        } else if (!resData) {
          setData(undefined);
        } else {
          setData({
            id: resData.id,
            username: resData.username,
            displayName: resData.display_name,
            passwordHash: resData.password_hash,
            role: resData.role,
            services: resData.services,
            color: resData.color,
            active: resData.active,
            createdAt: new Date(resData.created_at).getTime(),
          });
        }
      });
  }, [username]);

  return data;
}

export function useConfig(): Config | undefined {
  const [data, setData] = useState<Config | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("config")
      .select("*")
      .eq("id", "app")
      .maybeSingle()
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useConfig:", error);
          setData(undefined);
        } else if (!resData) {
          setData(undefined);
        } else {
          setData({
            id: resData.id,
            sessionTimeoutHours: Number(resData.session_timeout_hours),
            orderCounter: resData.order_counter,
            subscriptionCounter: resData.subscription_counter,
            notificationEnabled: resData.notification_enabled,
            serviceOperatorMap: resData.service_operator_map,
            priceRanges: resData.price_ranges,
            faqs: resData.faqs,
            pagoMovil: resData.pago_movil,
            disclaimers: resData.disclaimers,
            createdAt: new Date(resData.created_at).getTime(),
            updatedAt: new Date(resData.updated_at).getTime(),
          });
        }
      });
  }, []);

  return data;
}

export function useOrders(filter?: {
  status?: OrderStatus;
  q?: string;
}): Order[] | undefined {
  const [data, setData] = useState<Order[] | undefined>(undefined);
  const statusStr = filter?.status;
  const queryStr = filter?.q;

  useEffect(() => {
    let query = supabase.from("orders").select("*");
    
    if (statusStr) {
      query = query.eq("status", statusStr);
    }
    
    query.then(({ data: resData, error }) => {
      if (error) {
        console.error("Error useOrders:", error);
        setData([]);
        return;
      }

      let mapped = (resData || []).map((o: any) => ({
        id: o.id,
        clientPhone: o.client_phone,
        clientName: o.client_name,
        serviceType: o.service_type,
        operatorId: o.operator_id,
        details: o.details,
        hasMaterial: o.has_material,
        price: Number(o.price),
        paidAmount: Number(o.paid_amount),
        totalPaid: Number(o.total_paid),
        paymentRef: o.payment_ref,
        status: o.status,
        urgent: o.urgent,
        paymentStatus: o.payment_status,
        statusHistory: o.status_history,
        createdAt: o.created_at,
        dueDate: o.due_date,
        completedAt: o.completed_at,
        notes: o.notes,
        subscriptionId: o.subscription_id,
        coverageTipo: o.coverage_tipo,
      }));

      if (queryStr) {
        const qLower = queryStr.toLowerCase();
        mapped = mapped.filter(
          (o) =>
            o.clientName.toLowerCase().includes(qLower) ||
            o.clientPhone.toLowerCase().includes(qLower) ||
            o.id.toLowerCase().includes(qLower)
        );
      }

      // Ordenar por fecha descendente
      mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setData(mapped);
    });
  }, [statusStr, queryStr]);

  return data;
}

export function useOrder(id: string | undefined): Order | undefined {
  const [data, setData] = useState<Order | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setData(undefined);
      return;
    }
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data: o, error }) => {
        if (error) {
          console.error("Error useOrder:", error);
          setData(undefined);
        } else if (!o) {
          setData(undefined);
        } else {
          setData({
            id: o.id,
            clientPhone: o.client_phone,
            clientName: o.client_name,
            serviceType: o.service_type,
            operatorId: o.operator_id,
            details: o.details,
            hasMaterial: o.has_material,
            price: Number(o.price),
            paidAmount: Number(o.paid_amount),
            totalPaid: Number(o.total_paid),
            paymentRef: o.payment_ref,
            status: o.status,
            urgent: o.urgent,
            paymentStatus: o.payment_status,
            statusHistory: o.status_history,
            createdAt: o.created_at,
            dueDate: o.due_date,
            completedAt: o.completed_at,
            notes: o.notes,
            subscriptionId: o.subscription_id,
            coverageTipo: o.coverage_tipo,
          });
        }
      });
  }, [id]);

  return data;
}

export function useAttachments(orderId: string | undefined): OrderAttachment[] | undefined {
  const [data, setData] = useState<OrderAttachment[] | undefined>(undefined);

  useEffect(() => {
    if (!orderId) {
      setData([]);
      return;
    }
    supabase
      .from("order_attachments")
      .select("*")
      .eq("order_id", orderId)
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useAttachments:", error);
          setData([]);
        } else {
          const mapped = (resData || []).map((a: any) => ({
            id: a.id,
            orderId: a.order_id,
            name: a.name,
            mime: a.mime,
            size: a.size,
            blob: new Blob([]), // El blob se maneja vía URL de storage en Supabase
            author: a.author,
            uploadedAt: a.uploaded_at,
          }));
          setData(mapped);
        }
      });
  }, [orderId]);

  return data;
}

export function useClients(): Client[] | undefined {
  const [data, setData] = useState<Client[] | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("clients")
      .select("*")
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useClients:", error);
          setData([]);
        } else {
          const mapped = (resData || []).map((c: any) => ({
            phone: c.phone,
            name: c.name,
            email: c.email || undefined,
            notes: c.notes || undefined,
            totalOrders: c.total_orders,
            totalSpent: Number(c.total_spent),
            subscription: c.subscription,
            history: c.history || [],
          }));
          setData(mapped);
        }
      });
  }, []);

  return data;
}

export function useClient(phone: string | undefined): Client | undefined {
  const [data, setData] = useState<Client | undefined>(undefined);

  useEffect(() => {
    if (!phone) {
      setData(undefined);
      return;
    }
    supabase
      .from("clients")
      .select("*")
      .eq("phone", phone)
      .maybeSingle()
      .then(({ data: c, error }) => {
        if (error) {
          console.error("Error useClient:", error);
          setData(undefined);
        } else if (!c) {
          setData(undefined);
        } else {
          setData({
            phone: c.phone,
            name: c.name,
            email: c.email || undefined,
            notes: c.notes || undefined,
            totalOrders: c.total_orders,
            totalSpent: Number(c.total_spent),
            subscription: c.subscription,
            history: c.history || [],
          });
        }
      });
  }, [phone]);

  return data;
}

export function useSubscriptions(): Subscription[] | undefined {
  const [data, setData] = useState<Subscription[] | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("subscriptions")
      .select("*")
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useSubscriptions:", error);
          setData([]);
        } else {
          const mapped = (resData || []).map((s: any) => ({
            id: s.id,
            clientPhone: s.client_phone,
            type: s.type,
            startDate: s.start_date,
            endDate: s.end_date,
            price: Number(s.price),
            status: s.status,
            monthlyQuota: s.monthly_quota,
            usedPerMonth: s.used_per_month,
          }));
          setData(mapped);
        }
      });
  }, []);

  return data;
}

export function useClientSubscriptions(phone: string | undefined): Subscription[] | undefined {
  const [data, setData] = useState<Subscription[] | undefined>(undefined);

  useEffect(() => {
    if (!phone) {
      setData(undefined);
      return;
    }
    supabase
      .from("subscriptions")
      .select("*")
      .eq("client_phone", phone)
      .then(({ data: resData, error }) => {
        if (error) {
          console.error("Error useClientSubscriptions:", error);
          setData([]);
        } else {
          const mapped = (resData || []).map((s: any) => ({
            id: s.id,
            clientPhone: s.client_phone,
            type: s.type,
            startDate: s.start_date,
            endDate: s.end_date,
            price: Number(s.price),
            status: s.status,
            monthlyQuota: s.monthly_quota,
            usedPerMonth: s.used_per_month,
          }));
          setData(mapped);
        }
      });
  }, [phone]);

  return data;
}

export async function upsertOperator(op: Operator): Promise<void> {
  const { error } = await supabase.from("operators").upsert({
    id: op.id,
    username: op.username,
    display_name: op.displayName,
    password_hash: op.passwordHash,
    role: op.role,
    services: op.services,
    color: op.color,
    active: op.active,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateConfig(patch: Partial<Config>): Promise<void> {
  const mappedPatch: any = {};
  if (patch.sessionTimeoutHours !== undefined) mappedPatch.session_timeout_hours = patch.sessionTimeoutHours;
  if (patch.orderCounter !== undefined) mappedPatch.order_counter = patch.orderCounter;
  if (patch.subscriptionCounter !== undefined) mappedPatch.subscription_counter = patch.subscriptionCounter;
  if (patch.notificationEnabled !== undefined) mappedPatch.notification_enabled = patch.notificationEnabled;
  if (patch.serviceOperatorMap !== undefined) mappedPatch.service_operator_map = patch.serviceOperatorMap;
  if (patch.priceRanges !== undefined) mappedPatch.price_ranges = patch.priceRanges;
  if (patch.faqs !== undefined) mappedPatch.faqs = patch.faqs;
  if (patch.pagoMovil !== undefined) mappedPatch.pago_movil = patch.pagoMovil;
  if (patch.disclaimers !== undefined) mappedPatch.disclaimers = patch.disclaimers;

  mappedPatch.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("config")
    .update(mappedPatch)
    .eq("id", "app");

  if (error) {
    throw new Error(error.message);
  }
}

export function useDatabase() {
  return {
    useOperators,
    useOperator,
    useConfig,
    useOrders,
    useOrder,
    useAttachments,
    useClients,
    useClient,
    useSubscriptions,
    useClientSubscriptions,
    upsertOperator,
    updateConfig,
  };
}
