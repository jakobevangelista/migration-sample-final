import ClerkMigrationTool from "./_auth-migration/clientMigrationWrapper";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ClerkMigrationTool url={"/api/clerk-migrate"}>
      {children}
    </ClerkMigrationTool>
  );
}
