-- reporter.lua (ServerScriptService)
-- Detecta modelos na workspace e envia report ao backend

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- CONFIGURAÇÕES
local BACKEND_URL = "https://seu-dominio.exemplo/api/report" -- Altere para o seu domínio
local SECRET_KEY = "CHAVE_SECRETA_COMPARTILHADA" -- Altere para sua chave secreta
local SCAN_INTERVAL = 45 -- segundos

local MODELOS = {
    "La Secret Combinasion",
    "Garama and Mandung",
    "Los Bros",
    "Las SIS",
    "La Suprema Combinasion",
    "Los Mobilis",
    "Los Combinasionas",
    "Ketchuru and Musturu"
}

local cache = {}

local function BuscarModelos()
    local achados = {}
    for _, obj in ipairs(workspace:GetDescendants()) do
        if obj:IsA("Model") or obj:IsA("Folder") then
            for _, nome in ipairs(MODELOS) do
                if string.find(string.lower(obj.Name), string.lower(nome)) then
                    if not cache[nome] or os.time() - cache[nome] > 300 then
                        cache[nome] = os.time()
                        table.insert(achados, {Nome = nome, Caminho = obj:GetFullName()})
                    end
                end
            end
        end
    end
    return achados
end

local function EnviarRelatorio(dados)
    local body = HttpService:JSONEncode({secret = SECRET_KEY, payload = dados})
    local ok, res = pcall(function()
        return HttpService:PostAsync(BACKEND_URL, body, Enum.HttpContentType.ApplicationJson, false)
    end)
    if ok then
        print("[Brainrot Finder] Relatório enviado com sucesso!")
    else
        warn("[Brainrot Finder] Falha ao enviar relatório:", res)
    end
end

while task.wait(SCAN_INTERVAL) do
    local encontrados = BuscarModelos()
    if #encontrados > 0 then
        local payload = {
            placeId = game.PlaceId,
            jobId = tostring(game.JobId),
            timestamp = os.time(),
            serverPlayers = #Players:GetPlayers(),
            reports = encontrados
        }
        EnviarRelatorio(payload)
    end
end
