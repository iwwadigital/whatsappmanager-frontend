import Badge from "../ui/badge/Badge";

/** Badge de status ativo/inativo. */
export default function BadgeStatus({ ativo }: { ativo: boolean }) {
  return (
    <Badge size="sm" color={ativo ? "success" : "error"}>
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
}
