-- campaign_funds view (PRD §8)
-- Calculated from donations/disbursements, not editable columns
CREATE OR REPLACE VIEW campaign_funds AS
SELECT
  c.id AS campaign_id,
  c.slug,
  c.title,
  c.target_amount,
  c.status,
  -- Terkumpul: sum paid donations minus refunds
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(SUM(d.refund_amount) FILTER (WHERE d.status = 'refunded'), 0)
    AS collected,
  -- Operasional: sum of operational fees for paid donations
  COALESCE(SUM(d.operational_fee_amount) FILTER (WHERE d.status = 'paid'), 0)
    AS operational,
  -- Dicairkan: sum of disbursed/reported disbursements
  COALESCE(
    (SELECT SUM(dis.amount) FROM disbursements dis
     WHERE dis.campaign_id = c.id AND dis.status IN ('disbursed', 'reported')),
    0
  ) AS disbursed,
  -- Sisa: collected - operational - disbursed
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(SUM(d.refund_amount) FILTER (WHERE d.status = 'refunded'), 0)
    - COALESCE(SUM(d.operational_fee_amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(
        (SELECT SUM(dis.amount) FROM disbursements dis
         WHERE dis.campaign_id = c.id AND dis.status IN ('disbursed', 'reported')),
        0
      )
    AS remaining,
  -- Belum dilaporkan: disbursements that are 'disbursed' but not 'reported'
  COALESCE(
    (SELECT SUM(dis.amount) FROM disbursements dis
     WHERE dis.campaign_id = c.id AND dis.status = 'disbursed'),
    0
  ) AS unreported
FROM campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
GROUP BY c.id, c.slug, c.title, c.target_amount, c.status;
