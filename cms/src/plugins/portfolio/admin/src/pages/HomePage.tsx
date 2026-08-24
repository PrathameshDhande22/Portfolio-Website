import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Typography } from "@strapi/design-system";
import { getFetchClient } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import { getTranslation } from "../utils/getTranslation";

type SyncStatus = "started" | "processing" | "completed" | "failed";

interface SyncState {
  id: number;
  status: SyncStatus;
  startdate: string;
  enddate: string | null;
  error: string | null;
}

interface AssistantReply {
  status: number;
  payload: {
    status?: string;
    message?: string;
    data?: SyncState | null;
    revalidated?: boolean;
  };
}

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useMemo(() => getFetchClient(), []);
  const [state, setState] = useState<SyncState | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const { data } = await get<AssistantReply>("/portfolio/sync/status");
      setState(data.payload.data ?? null);
    } catch {
      setNote("Could not read the sync status.");
    }
  }, [get]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const triggerSync = async () => {
    setBusy(true);
    try {
      const { data } = await post<AssistantReply>("/portfolio/sync", {});
      setNote(
        data.status === 202
          ? "Sync queued. It runs in the background."
          : (data.payload.message ?? "The assistant refused the request."),
      );
      await loadStatus();
    } catch {
      setNote("Could not reach the assistant.");
    } finally {
      setBusy(false);
    }
  };

  const revalidateCache = async () => {
    setBusy(true);
    try {
      const { data } = await post<AssistantReply>("/portfolio/revalidate", {});
      setNote(
        data.status === 200
          ? "Website cache cleared. Fresh content is live."
          : (data.payload.message ?? "The website refused the request."),
      );
    } catch {
      setNote("Could not reach the website.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box padding={8}>
      <Typography variant="alpha" tag="h1">
        {formatMessage({ id: getTranslation("page.title"), defaultMessage: "Portfolio assistant" })}
      </Typography>

      <Box paddingTop={2} paddingBottom={6}>
        <Typography variant="epsilon" textColor="neutral600">
          {formatMessage({
            id: getTranslation("page.subtitle"),
            defaultMessage:
              "Re-index the resume, articles and custom knowledge, and clear the website cache.",
          })}
        </Typography>
      </Box>

      <Flex gap={2}>
        <Button onClick={triggerSync} loading={busy} disabled={busy}>
          {formatMessage({ id: getTranslation("action.sync"), defaultMessage: "Sync AI knowledge" })}
        </Button>
        <Button variant="secondary" onClick={revalidateCache} disabled={busy}>
          {formatMessage({
            id: getTranslation("action.revalidate"),
            defaultMessage: "Revalidate website cache",
          })}
        </Button>
        <Button variant="tertiary" onClick={() => void loadStatus()} disabled={busy}>
          {formatMessage({ id: getTranslation("action.refresh"), defaultMessage: "Refresh status" })}
        </Button>
      </Flex>

      {note ? (
        <Box paddingTop={4}>
          <Typography variant="pi" textColor="neutral600">
            {note}
          </Typography>
        </Box>
      ) : null}

      <Box paddingTop={6}>
        <Typography variant="delta" tag="h2">
          {formatMessage({ id: getTranslation("status.title"), defaultMessage: "Last sync" })}
        </Typography>
        <Box paddingTop={2}>
          {state ? (
            <Flex direction="column" alignItems="start" gap={1}>
              <Typography variant="pi">Status: {state.status}</Typography>
              <Typography variant="pi">Started: {state.startdate}</Typography>
              <Typography variant="pi">Finished: {state.enddate ?? "still running"}</Typography>
              {state.error ? (
                <Typography variant="pi" textColor="danger600">
                  Error: {state.error}
                </Typography>
              ) : null}
            </Flex>
          ) : (
            <Typography variant="pi" textColor="neutral600">
              No sync has run yet.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export { HomePage };
