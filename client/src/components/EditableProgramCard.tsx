import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditableProgramCard({
  program,
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{program.nome}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card de edição desativado nesta versão</p>
      </CardContent>
    </Card>
  );
}
