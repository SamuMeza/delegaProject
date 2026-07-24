# Contract: WhatsApp Message Format

**Feature**: `003-fuente-clientes`
**Date**: 2026-07-22

## Protocol

### WhatsApp Link Generation

The system generates a `wa.me` link with a pre-filled message to initiate client-operator communication.

**Interface:**
```
wa.me/{phone}?text={url-encoded-message}
```

| Component | Source | Format |
|-----------|--------|--------|
| `{phone}` | Environment variable `BUN_PUBLIC_WHATSAPP_NUMBER` | International format without `+` or `00` prefix (e.g., `584121234567`) |
| `{url-encoded-message}` | Client-side form data, serialized by the WhatsApp generator component | URL-encoded string |

### Message Template

The message body sent to WhatsApp is a structured, human-readable string containing all order details from the form submission:

```
【Nueva Solicitud de Delega】

📋 ID de seguimiento: {token}
👤 Cliente: {clientName}
📞 Contacto: {clientContact}
🎓 Servicio: {serviceType}
📝 Descripción: {description}
⚙️ Parámetros: {parameters}
💰 Precio estimado: ${estimatedPrice}
📅 Fecha de solicitud: {createdAt (YYYY-MM-DD HH:mm)}
```

### Client-Side Token Generation

Tokens are generated in the browser at form submission time using:

1. Serialize order request data as JSON
2. Create signature: `SHA256(JSON.stringify(data) + BUN_PUBLIC_TRACKING_SALT)`
3. Encode: `Base64(JSON.stringify(data) + '.' + signature)`

This token is included in the WhatsApp message and serves as the tracking identifier.

## Integration Points

- **WhatsApp client**: Opens via `window.open('wa.me/...')` or falls back to clipboard copy
- **Operator panel**: Operator imports the token to cross-reference with order records
- **Tracking page**: `/orden/:token` decodes and validates the token on the client side

## Error Handling

- If WhatsApp app is not installed: fallback to clipboard copy button
- If encoding fails: display error message in the form UI
- If token validation fails on tracking page: show "Enlace no válido" error